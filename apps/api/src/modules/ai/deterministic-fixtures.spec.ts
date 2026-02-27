import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { AiInvalidJsonError, AiService } from './ai.service';
import { PexelsService } from './pexels.service';
import { repairPayload } from './repair-pipeline';
import { resolveTemplatePlaceholders } from './section-templates';
import { canonicalPageHash } from '../pages/canonical-page-hash';
import { PreviewRendererService } from '../pages/preview-renderer.service';
import {
  validatePublishManifest,
  type PublishManifest,
} from '../publish/publish-manifest';

function expectedDeterministicId(seed: string) {
  return createHash('sha1').update(seed).digest('hex').slice(0, 12);
}

function collectAssetsNeeded(editorJson: unknown, availableAssetIds: string[]) {
  const refs = new Set(availableAssetIds);
  const needed: Array<{
    path: string;
    reason: 'missing_asset_ref' | 'asset_not_found';
  }> = [];

  const page =
    editorJson && typeof editorJson === 'object' && !Array.isArray(editorJson)
      ? (editorJson as Record<string, unknown>)
      : {};
  const sections = Array.isArray(page.sections) ? page.sections : [];

  sections.forEach((section, sectionIndex) => {
    const sectionRec =
      section && typeof section === 'object' && !Array.isArray(section)
        ? (section as Record<string, unknown>)
        : {};
    const blocks = Array.isArray(sectionRec.blocks) ? sectionRec.blocks : [];

    blocks.forEach((block, blockIndex) => {
      const blockRec =
        block && typeof block === 'object' && !Array.isArray(block)
          ? (block as Record<string, unknown>)
          : {};
      const nodes = Array.isArray(blockRec.nodes) ? blockRec.nodes : [];

      nodes.forEach((node, nodeIndex) => {
        const nodeRec =
          node && typeof node === 'object' && !Array.isArray(node)
            ? (node as Record<string, unknown>)
            : {};
        const type =
          typeof nodeRec.type === 'string' ? nodeRec.type.toLowerCase() : '';
        if (type !== 'image') return;

        const assetRef =
          typeof nodeRec.asset_ref === 'string' ? nodeRec.asset_ref.trim() : '';
        const path = `sections[${sectionIndex}].blocks[${blockIndex}].nodes[${nodeIndex}]`;
        if (!assetRef) {
          needed.push({ path, reason: 'missing_asset_ref' });
          return;
        }
        if (!refs.has(assetRef)) {
          needed.push({ path, reason: 'asset_not_found' });
        }
      });
    });
  });

  return needed;
}

describe('deterministic-fixtures (phase-1 batch 9)', () => {
  const config = {
    get: jest.fn().mockReturnValue(''),
  } as unknown as ConfigService;

  const pexels = {
    searchImage: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
  } as unknown as PexelsService;

  const ai = new AiService(config, pexels);

  const validSitePayload = {
    project: {
      name: 'Fixture Site',
      industry: 'Technology',
      primaryColor: '#1F6FEB',
      secondaryColor: '#10B981',
      fontPair: { heading: 'Poppins', body: 'Inter' },
    },
    seo: {
      title: 'Fixture Title',
      description: 'Fixture Description',
      keywords: ['fixture'],
    },
    pages: [
      {
        slug: 'home',
        title: 'Home',
        sections: [
          {
            type: 'hero',
            headline: 'Headline',
            subheadline: 'Subheadline text',
            cta: 'Start',
          },
          {
            type: 'features',
            items: [{ title: 'Feature', description: 'Details' }],
          },
          {
            type: 'pricing',
            headline: 'Pricing',
            plans: [
              {
                name: 'Starter',
                price: '$10',
                features: ['One'],
              },
            ],
          },
          {
            type: 'footer',
            text: 'Footer text',
            links: [{ label: 'Contact', href: '#' }],
          },
        ],
      },
    ],
  };

  it('R-B9-001: missing node_id repaired deterministically', () => {
    const fixtureInput = {
      sections: [
        {
          blocks: [{ nodes: [{ type: 'text', text: 'Hello fixture' }] }],
        },
      ],
    };

    const first = repairPayload(fixtureInput);
    const second = repairPayload(fixtureInput);

    const firstNode = (
      first.repaired as {
        sections: Array<{ blocks: Array<{ nodes: Array<{ id: string }> }> }>;
      }
    ).sections[0].blocks[0].nodes[0];
    const secondNode = (
      second.repaired as {
        sections: Array<{ blocks: Array<{ nodes: Array<{ id: string }> }> }>;
      }
    ).sections[0].blocks[0].nodes[0];

    expect(firstNode.id).toBe(
      expectedDeterministicId('sections[0].blocks[0].nodes[0]'),
    );
    expect(firstNode.id).toBe(secondNode.id);
  });

  it('R-B9-002: slug uniqueness validation fails deterministically', () => {
    const duplicateSlugPayload = {
      ...validSitePayload,
      pages: [
        validSitePayload.pages[0],
        {
          ...validSitePayload.pages[0],
          slug: 'home',
          title: 'Another Home',
        },
      ],
    };

    expect(() =>
      (
        ai as unknown as { validateGeneratedSite: (input: unknown) => unknown }
      ).validateGeneratedSite(duplicateSlugPayload),
    ).toThrow(AiInvalidJsonError);

    expect(() =>
      (
        ai as unknown as { validateGeneratedSite: (input: unknown) => unknown }
      ).validateGeneratedSite(duplicateSlugPayload),
    ).toThrow(/Duplicate page slug/);
  });

  it('R-B9-003: missing asset_ref produces deterministic assets_needed fixture output', () => {
    const fixtureInput = {
      sections: [
        {
          blocks: [
            {
              nodes: [
                { type: 'image', src: 'https://example.com/a.png' },
                { type: 'image', asset_ref: 'asset-missing' },
              ],
            },
          ],
        },
      ],
    };

    const needed = collectAssetsNeeded(fixtureInput, ['asset-present']);

    expect(needed).toEqual([
      {
        path: 'sections[0].blocks[0].nodes[0]',
        reason: 'missing_asset_ref',
      },
      {
        path: 'sections[0].blocks[0].nodes[1]',
        reason: 'asset_not_found',
      },
    ]);
  });

  it('R-B9-004: hero-style fixture html/css/hash remains snapshot-stable', () => {
    const renderer = new PreviewRendererService();
    const preview = renderer.render({
      pageId: 'fixture-home',
      editorJson: {
        sections: [
          {
            id: 'section_fixture_hero',
            blocks: [
              {
                id: 'block_fixture_hero',
                nodes: [
                  {
                    id: 'node_h1',
                    type: 'text',
                    tag: 'h1',
                    text: 'Hero Fixture',
                  },
                  {
                    id: 'node_copy',
                    type: 'text',
                    text: 'Deterministic layout fixture',
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect({ html: preview.html, css: preview.css, hash: preview.hash })
      .toMatchInlineSnapshot(`
      {
        "css": ".baw-page{--baw-color-primary:#111827;--baw-color-background:#ffffff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--baw-color-primary);background:var(--baw-color-background);max-width:1200px;margin:0 auto;padding:24px;line-height:1.5}
      .baw-nav{display:flex;gap:12px;padding:12px 0}
      .baw-nav a{text-decoration:none}
      .baw-section{margin:0 0 24px}
      .baw-block{display:grid;gap:12px}
      .baw-node-text{margin:0}
      .baw-node-button{display:inline-block;padding:10px 16px;border-radius:8px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600}
      .baw-node-image{max-width:100%;height:auto;border-radius:8px;display:block}",
        "hash": "ed10eb34ce78566c64c13b687be2c176b0fbbb0b449e1d63cb11df5fec533865",
        "html": "<div class="baw-page" data-page="fixture-home"><section class="baw-section" data-section="section_fixture_hero" id="section_fixture_hero"><div class="baw-block" data-block="block_fixture_hero" id="block_fixture_hero"><h1 class="baw-node-text" id="node_h1">Hero Fixture</h1><p class="baw-node-text" id="node_copy">Deterministic layout fixture</p></div></section></div>",
      }
    `);
  });

  it('R-B9-005: publish manifest hash fixture is stable for identical input', () => {
    const payloadA = {
      pages: [{ id: 'page-1', slug: '/home' }],
      tokens: { color: { primary: '#123456' } },
    };

    const pageHashA = canonicalPageHash({
      pageJson: payloadA.pages,
      tokensJson: payloadA.tokens,
    });
    const pageHashB = canonicalPageHash({
      pageJson: payloadA.pages,
      tokensJson: payloadA.tokens,
    });

    expect(pageHashA).toBe(pageHashB);

    const manifest = validatePublishManifest({
      schema_version: '1.0',
      site_id: 'site-1',
      publish_id: 'publish-1',
      hash: pageHashA,
      renderer_version: 'renderer.v1',
      pages: [
        {
          page_id: 'page-1',
          slug: '/home',
          hash: pageHashA,
          path: 'index.html',
        },
      ],
      assets: [],
    });

    expect(manifest.hash).toBe(pageHashA);
  });

  it('R-B9-006: a11y fixture rejects missing alt in strict mode', () => {
    const renderer = new PreviewRendererService();
    const previous = process.env.PREVIEW_RENDER_VALIDATION_MODE;
    process.env.PREVIEW_RENDER_VALIDATION_MODE = 'strict';

    expect(() =>
      renderer.render({
        pageId: 'fixture-a11y',
        editorJson: {
          sections: [
            {
              blocks: [
                {
                  nodes: [
                    { type: 'image', src: 'https://example.com/img.png' },
                  ],
                },
              ],
            },
          ],
        },
      }),
    ).toThrow(/alt text/i);

    process.env.PREVIEW_RENDER_VALIDATION_MODE = previous;
  });

  it('R-B9-007: token placeholder fallback deterministic for missing tokens', () => {
    expect(resolveTemplatePlaceholders('Plan: {{pricing.starter}}', {})).toBe(
      'Plan: literal:pricing.starter',
    );
    expect(
      resolveTemplatePlaceholders('Plan: {{pricing.starter}}', {
        'pricing.starter': '$29/mo',
      }),
    ).toBe('Plan: $29/mo');
  });

  it('R-B9-008: canonical page hash changes when payload changes', () => {
    const base = canonicalPageHash({
      tokensJson: { color: { primary: '#111111' } },
      pageJson: { sections: [{ id: 'a' }] },
    });
    const changed = canonicalPageHash({
      tokensJson: { color: { primary: '#222222' } },
      pageJson: { sections: [{ id: 'a' }] },
    });

    expect(base).not.toBe(changed);
  });

  it('R-B9-009: publish manifest schema validation rejects missing required fields', () => {
    const invalidManifest: Partial<PublishManifest> = {
      schema_version: '1.0',
      site_id: 'site-1',
      publish_id: 'publish-1',
      // hash intentionally missing
      renderer_version: 'renderer.v1',
      pages: [],
      assets: [],
    };

    expect(() => validatePublishManifest(invalidManifest)).toThrow();
  });

  it('R-B9-010: repair pipeline canonical sorting remains deterministic', () => {
    const fixtureInput = {
      id: 'root0001',
      items: [{ value: 'z' }, { value: 'a' }, { value: 'm' }],
    };

    const first = repairPayload(fixtureInput);
    const second = repairPayload(fixtureInput);

    const firstItems = (first.repaired as { items: Array<{ value: string }> })
      .items;
    const secondItems = (second.repaired as { items: Array<{ value: string }> })
      .items;

    expect(firstItems.map((entry) => entry.value)).toEqual(['a', 'm', 'z']);
    expect(firstItems).toEqual(secondItems);
  });

  it('R-B9-011: repair mode keeps one h1 by deterministic demotion', () => {
    const previous = process.env.PREVIEW_RENDER_VALIDATION_MODE;
    process.env.PREVIEW_RENDER_VALIDATION_MODE = 'repair';

    const renderer = new PreviewRendererService();
    const preview = renderer.render({
      pageId: 'fixture-h1',
      editorJson: {
        sections: [
          {
            blocks: [
              {
                nodes: [
                  { type: 'text', tag: 'h1', text: 'Primary' },
                  { type: 'text', tag: 'h1', text: 'Secondary' },
                ],
              },
            ],
          },
        ],
      },
    });

    expect((preview.html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect((preview.html.match(/<h2\b/g) ?? []).length).toBe(1);

    process.env.PREVIEW_RENDER_VALIDATION_MODE = previous;
  });
});
