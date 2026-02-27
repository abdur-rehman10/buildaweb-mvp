import { readStrictnessMode, repairPayload } from './repair-pipeline';

describe('repair-pipeline', () => {
  it('fills missing ids deterministically', () => {
    const input = { type: 'node', href: 'https://example.com' };
    const first = repairPayload(input);
    const second = repairPayload(input);

    expect((first.repaired as { id: string }).id).toBeDefined();
    expect((first.repaired as { id: string }).id).toBe(
      (second.repaired as { id: string }).id,
    );
  });

  it('sorts arrays canonically', () => {
    const input = { id: 'abc12345', items: [{ id: 'b' }, { id: 'a' }] };
    const { repaired } = repairPayload(input);
    expect((repaired as { items: Array<{ id: string }> }).items[0].id).toBe(
      'a',
    );
  });

  it('defaults button variant', () => {
    const input = { id: 'btn12345', type: 'button' };
    const { repaired } = repairPayload(input);
    expect((repaired as { variant: string }).variant).toBe('primary');
  });

  it('drops unsafe rawHtml and normalizes href/tokenRef', () => {
    const input = {
      id: 'node12345',
      rawHtml: '<script>bad()</script>',
      href: 'javascript:alert(1)',
      tokenRef: 'color.primary',
    };

    const { repaired } = repairPayload(input);
    const asObj = repaired as Record<string, unknown>;

    expect(asObj.rawHtml).toBeUndefined();
    expect(asObj.href).toBe('#');
    expect(asObj.tokenRef).toBe('literal:color.primary');
  });

  it('injects deterministic alt text for image nodes when missing', () => {
    const { repaired, audit } = repairPayload({
      type: 'image',
      src: 'https://example.com/a.png',
    });
    const image = repaired as { alt?: string };

    expect(image.alt).toBe('Image');
    expect(audit.some((entry) => entry.action === 'inject-image-alt')).toBe(
      true,
    );
  });

  it('demotes extra h1 text nodes to h2 deterministically', () => {
    const input = {
      sections: [
        {
          blocks: [
            {
              nodes: [
                { type: 'text', tag: 'h1', text: 'Heading A' },
                { type: 'text', tag: 'h1', text: 'Heading B' },
              ],
            },
          ],
        },
      ],
    };

    const { repaired, audit } = repairPayload(input, { fillMissingIds: false });
    const nodes = (
      repaired as {
        sections: Array<{ blocks: Array<{ nodes: Array<{ tag?: string }> }> }>;
      }
    ).sections[0].blocks[0].nodes;

    expect(nodes[0].tag).toBe('h1');
    expect(nodes[1].tag).toBe('h2');
    expect(audit.some((entry) => entry.action === 'demote-extra-h1')).toBe(
      true,
    );
  });

  it('reads strictness mode safely with strict default', () => {
    expect(readStrictnessMode(undefined)).toBe('strict');
    expect(readStrictnessMode('strict')).toBe('strict');
    expect(readStrictnessMode('repair')).toBe('repair');
    expect(readStrictnessMode('other')).toBe('strict');
  });
});
