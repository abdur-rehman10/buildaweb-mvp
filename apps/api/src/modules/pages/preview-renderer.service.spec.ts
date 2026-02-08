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
});
