import { Model } from 'mongoose';
import { AssetsService } from '../assets/assets.service';
import { NavigationDocument } from '../navigation/navigation.schema';
import { ProjectsService } from '../projects/projects.service';
import { PreviewController } from './preview.controller';
import { PreviewRendererService } from './preview-renderer.service';
import { PagesService } from './pages.service';

function createNavQueryMock(itemsJson: unknown[]) {
  return {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({ itemsJson }),
  };
}

describe('PreviewController pretty URLs', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';

  let controller: PreviewController;
  let projects: { getByIdScoped: jest.Mock };
  let pages: { listPages: jest.Mock; getPage: jest.Mock };
  let assets: { getByIdsScoped: jest.Mock };
  let previewRenderer: { render: jest.Mock };
  let navigationModel: { findOne: jest.Mock };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn().mockResolvedValue({ _id: projectId }),
    };

    pages = {
      listPages: jest.fn().mockResolvedValue([
        { id: 'page-home', title: 'Home', slug: '/', isHome: true, version: 1 },
        { id: 'page-about', title: 'About', slug: 'about', isHome: false, version: 1 },
      ]),
      getPage: jest.fn().mockImplementation(({ pageId }: { pageId: string }) => {
        if (pageId === 'page-about') {
          return Promise.resolve({
            _id: 'page-about',
            slug: 'about',
            isHome: false,
            editorJson: {
              sections: [
                {
                  blocks: [
                    {
                      nodes: [{ type: 'text', content: 'About page' }],
                    },
                  ],
                },
              ],
            },
          });
        }
        return Promise.resolve(null);
      }),
    };

    assets = {
      getByIdsScoped: jest.fn().mockResolvedValue([]),
    };

    previewRenderer = {
      render: jest.fn().mockReturnValue({
        html: '<div>preview</div>',
        css: '.x{}',
        hash: 'hash',
      }),
    };

    navigationModel = {
      findOne: jest.fn().mockReturnValue(createNavQueryMock([])),
    };

    controller = new PreviewController(
      projects as unknown as ProjectsService,
      pages as unknown as PagesService,
      assets as unknown as AssetsService,
      previewRenderer as unknown as PreviewRendererService,
      navigationModel as unknown as Model<NavigationDocument>,
    );
  });

  it('loads page by slug for preview requests without index.html', async () => {
    const req = { user: { sub: ownerUserId, tenantId } };

    const res = await controller.previewPage(projectId, 'about', req);

    expect(res).toEqual({
      ok: true,
      data: { html: '<div>preview</div>', css: '.x{}', hash: 'hash' },
    });
    expect(pages.getPage).toHaveBeenCalledWith({
      tenantId,
      projectId,
      pageId: 'page-about',
    });
    expect(previewRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({
        pageId: 'page-about',
        currentSlug: '/about',
      }),
    );
  });

  it('loads the same page for /:slug/index.html requests', async () => {
    const req = { user: { sub: ownerUserId, tenantId } };

    const withoutIndex = await controller.previewPage(projectId, 'about', req);
    const withIndex = await controller.previewBySlugWithIndex(projectId, 'about', req);

    expect(withIndex).toEqual(withoutIndex);
    expect(previewRenderer.render).toHaveBeenCalledWith(
      expect.objectContaining({
        pageId: 'page-about',
        currentSlug: '/about',
      }),
    );
  });
});
