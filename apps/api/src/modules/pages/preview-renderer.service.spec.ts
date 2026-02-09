import { PreviewRendererService } from './preview-renderer.service';

describe('PreviewRendererService pretty URLs', () => {
  let service: PreviewRendererService;

  beforeEach(() => {
    service = new PreviewRendererService();
  });

  it('renders navigation and button links as directory paths with trailing slashes', () => {
    const preview = service.render({
      pageId: 'page-about',
      currentSlug: '/about',
      navLinks: [
        { label: 'Home', targetSlug: '/' },
        { label: 'Contact', targetSlug: '/contact' },
      ],
      editorJson: {
        sections: [
          {
            id: 'section-1',
            blocks: [
              {
                id: 'block-1',
                nodes: [{ id: 'node-1', type: 'button', label: 'Team', href: '/team' }],
              },
            ],
          },
        ],
      },
    });

    expect(preview.html).toContain('href="../contact/"');
    expect(preview.html).toContain('href="../team/"');
    expect(preview.html).not.toContain('index.html');
  });

  it('renders root links without index.html', () => {
    const preview = service.render({
      pageId: 'page-home',
      currentSlug: '/',
      navLinks: [{ label: 'About', targetSlug: '/about' }],
      editorJson: {
        sections: [
          {
            blocks: [
              {
                nodes: [{ type: 'button', label: 'Go home', href: '/' }],
              },
            ],
          },
        ],
      },
    });

    expect(preview.html).toContain('href="about/"');
    expect(preview.html).toContain('href="/"');
    expect(preview.html).not.toContain('index.html');
  });

  it('renders seo title and description meta tags', () => {
    const preview = service.render({
      pageId: 'page-home',
      pageTitle: 'Fallback Title',
      seoJson: {
        title: 'SEO Title',
        description: 'SEO Description',
      },
      editorJson: { sections: [] },
    });

    expect(preview.headTags).toContain('<title>SEO Title</title>');
    expect(preview.headTags).toContain('<meta name="description" content="SEO Description" />');
    expect(preview.headTags).not.toContain('property="og:');
  });

  it('falls back title to page title and omits optional meta tags when seoJson is empty', () => {
    const preview = service.render({
      pageId: 'page-home',
      pageTitle: 'Fallback Title',
      seoJson: {},
      editorJson: { sections: [] },
    });

    expect(preview.headTags).toContain('<title>Fallback Title</title>');
    expect(preview.headTags).not.toContain('name="description"');
    expect(preview.headTags).not.toContain('property="og:title"');
    expect(preview.headTags).not.toContain('property="og:description"');
    expect(preview.headTags).not.toContain('property="og:image"');
    expect(preview.headTags).not.toContain('rel="icon"');
  });

  it('uses project settings for title fallback, favicon, og:image, and lang', () => {
    const preview = service.render({
      pageId: 'page-home',
      pageTitle: 'Page Title',
      siteName: 'Project Site',
      faviconUrl: 'http://localhost:9000/buildaweb/assets/favicon.png',
      defaultOgImageUrl: 'http://localhost:9000/buildaweb/assets/default-og.png',
      locale: 'fr',
      seoJson: {},
      editorJson: { sections: [] },
    });

    expect(preview.headTags).toContain('<title>Project Site</title>');
    expect(preview.headTags).toContain('<link rel="icon" href="http://localhost:9000/buildaweb/assets/favicon.png" />');
    expect(preview.headTags).toContain(
      '<meta property="og:image" content="http://localhost:9000/buildaweb/assets/default-og.png" />',
    );
    expect(preview.lang).toBe('fr');
  });
});
