import {
  defaultRendererVersion,
  validatePublishManifest,
} from './publish-manifest';

describe('publish-manifest', () => {
  it('validates required manifest structure', () => {
    const manifest = validatePublishManifest({
      schema_version: '1.0',
      site_id: 'site-1',
      publish_id: 'publish-1',
      hash: 'abc123',
      renderer_version: defaultRendererVersion(),
      pages: [
        {
          page_id: 'page-1',
          slug: '/',
          hash: 'hash-1',
          path: 'published-sites/site-1/v1/index.html',
        },
      ],
      assets: [
        {
          object_path: 'published-sites/site-1/v1/styles.css',
          content_type: 'text/css; charset=utf-8',
        },
      ],
    });

    expect(manifest.schema_version).toBe('1.0');
    expect(manifest.renderer_version).toBe('v1');
  });

  it('fails when manifest is missing required keys', () => {
    expect(() =>
      validatePublishManifest({
        schema_version: '1.0',
        site_id: 'site-1',
      }),
    ).toThrow();
  });
});
