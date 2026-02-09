import { describe, expect, it } from 'vitest';
import { buildPublishBaseUrl, buildPublishIndexUrl, buildPublishPageUrl } from './publishUrls';

const baseParams = {
  minioBaseUrl: 'http://localhost:9000/buildaweb/',
  tenantId: 'default',
  projectId: 'project-1',
  publishId: 'publish-1',
};

describe('publishUrls', () => {
  it('builds home URL as .../index.html', () => {
    expect(
      buildPublishPageUrl({
        ...baseParams,
        slug: 'home',
      }),
    ).toBe(
      'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/index.html',
    );
  });

  it('builds about slug as .../about/index.html', () => {
    expect(
      buildPublishPageUrl({
        ...baseParams,
        slug: 'about',
      }),
    ).toBe(
      'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/about/index.html',
    );
  });

  it('normalizes /about/ slug to .../about/index.html', () => {
    expect(
      buildPublishPageUrl({
        ...baseParams,
        slug: '/about/',
      }),
    ).toBe(
      'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/about/index.html',
    );
  });

  it('treats empty slug as home URL', () => {
    expect(
      buildPublishPageUrl({
        ...baseParams,
        slug: '',
      }),
    ).toBe(
      'http://localhost:9000/buildaweb/buildaweb-sites/tenants/default/projects/project-1/publishes/publish-1/index.html',
    );
  });

  it('does not generate double slashes in path output', () => {
    const baseUrl = buildPublishBaseUrl(baseParams);
    const indexUrl = buildPublishIndexUrl(baseParams);
    const pageUrl = buildPublishPageUrl({
      ...baseParams,
      slug: '/about/',
    });

    const removeProtocol = (value: string) => value.replace(/^https?:\/\//, '');

    expect(removeProtocol(baseUrl)).not.toContain('//');
    expect(removeProtocol(indexUrl)).not.toContain('//');
    expect(removeProtocol(pageUrl)).not.toContain('//');
  });
});
