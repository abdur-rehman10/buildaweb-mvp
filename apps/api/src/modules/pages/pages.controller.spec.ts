import { ConflictException, HttpException } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { ProjectsService } from '../projects/projects.service';

describe('PagesController.updatePage', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';
  const pageId = '507f1f77bcf86cd799439012';

  let controller: PagesController;
  let pages: { updatePageJson: jest.Mock; deletePage: jest.Mock };
  let projects: { getByIdScoped: jest.Mock };

  beforeEach(() => {
    pages = {
      updatePageJson: jest.fn(),
      deletePage: jest.fn(),
    };

    projects = {
      getByIdScoped: jest.fn().mockResolvedValue({ _id: projectId }),
    };

    controller = new PagesController(
      pages as unknown as PagesService,
      projects as unknown as ProjectsService,
    );
  });

  it('passes seoJson to service and returns success payload', async () => {
    pages.updatePageJson.mockResolvedValue({
      _id: pageId,
      version: 2,
    });

    const res = await controller.updatePage(
      projectId,
      pageId,
      {
        page: { sections: [] },
        seoJson: {
          title: 'SEO title',
          description: 'SEO description',
        },
        version: 1,
      },
      { user: { sub: ownerUserId, tenantId } },
    );

    expect(pages.updatePageJson).toHaveBeenCalledWith({
      tenantId,
      projectId,
      pageId,
      page: {
        editorJson: { sections: [] },
        seoJson: {
          title: 'SEO title',
          description: 'SEO description',
        },
      },
      version: 1,
    });
    expect(res).toEqual({
      ok: true,
      data: {
        page_id: pageId,
        version: 2,
      },
    });
  });

  it('maps version mismatch to 409 VERSION_CONFLICT', async () => {
    pages.updatePageJson.mockRejectedValue(new ConflictException('Page version mismatch'));

    await expect(
      controller.updatePage(
        projectId,
        pageId,
        {
          page: { sections: [] },
          version: 2,
        },
        { user: { sub: ownerUserId, tenantId } },
      ),
    ).rejects.toMatchObject({
      status: 409,
      response: {
        ok: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'Page changed elsewhere',
        },
      },
    } as Partial<HttpException>);
  });
});

describe('PagesController.deletePage', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';
  const pageId = '507f1f77bcf86cd799439012';

  let controller: PagesController;
  let pages: { deletePage: jest.Mock };
  let projects: { getByIdScoped: jest.Mock };

  beforeEach(() => {
    pages = {
      deletePage: jest.fn(),
    };

    projects = {
      getByIdScoped: jest.fn().mockResolvedValue({ _id: projectId }),
    };

    controller = new PagesController(
      pages as unknown as PagesService,
      projects as unknown as ProjectsService,
    );
  });

  it('returns ok response on successful deletion', async () => {
    pages.deletePage.mockResolvedValue(undefined);

    const res = await controller.deletePage(
      projectId,
      pageId,
      { user: { sub: ownerUserId, tenantId } },
      '3',
    );

    expect(pages.deletePage).toHaveBeenCalledWith({
      tenantId,
      projectId,
      pageId,
      version: 3,
    });
    expect(res).toEqual({ ok: true, data: { deleted: true } });
  });

  it('maps version mismatch to 409 VERSION_CONFLICT', async () => {
    pages.deletePage.mockRejectedValue(new ConflictException('Page version mismatch'));

    await expect(
      controller.deletePage(
        projectId,
        pageId,
        { user: { sub: ownerUserId, tenantId } },
        '2',
      ),
    ).rejects.toMatchObject({
      status: 409,
      response: {
        ok: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'Page changed elsewhere',
        },
      },
    } as Partial<HttpException>);
  });
});

describe('PagesController page responses include seoJson', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';
  const pageId = '507f1f77bcf86cd799439012';

  let controller: PagesController;
  let pages: { listPages: jest.Mock; getPage: jest.Mock };
  let projects: { getByIdScoped: jest.Mock };

  beforeEach(() => {
    pages = {
      listPages: jest.fn(),
      getPage: jest.fn(),
    };

    projects = {
      getByIdScoped: jest.fn().mockResolvedValue({ _id: projectId }),
    };

    controller = new PagesController(
      pages as unknown as PagesService,
      projects as unknown as ProjectsService,
    );
  });

  it('returns seoJson in GET /projects/:projectId/pages response', async () => {
    pages.listPages.mockResolvedValue([
      {
        id: pageId,
        title: 'Home',
        slug: '/',
        isHome: true,
        seoJson: { title: 'SEO Home' },
        updatedAt: new Date('2026-02-09T00:00:00.000Z'),
        version: 1,
      },
    ]);

    const res = await controller.listPages(projectId, { user: { sub: ownerUserId, tenantId } });

    expect(res).toEqual({
      ok: true,
      data: {
        pages: [
          {
            id: pageId,
            title: 'Home',
            slug: '/',
            isHome: true,
            seoJson: { title: 'SEO Home' },
            updatedAt: new Date('2026-02-09T00:00:00.000Z'),
            version: 1,
          },
        ],
      },
    });
  });

  it('returns seoJson in GET /projects/:projectId/pages/:pageId response', async () => {
    pages.getPage.mockResolvedValue({
      _id: pageId,
      title: 'Home',
      slug: '/',
      isHome: true,
      editorJson: { sections: [] },
      seoJson: { title: 'SEO Home', description: 'Home desc' },
      version: 2,
      createdAt: new Date('2026-02-09T00:00:00.000Z'),
      updatedAt: new Date('2026-02-09T01:00:00.000Z'),
    });

    const res = await controller.getPage(projectId, pageId, { user: { sub: ownerUserId, tenantId } });

    expect(res).toEqual({
      ok: true,
      data: {
        page: expect.objectContaining({
          seoJson: { title: 'SEO Home', description: 'Home desc' },
        }),
      },
    });
  });

  it('keeps PUT payload seoJson pass-through for persistence', async () => {
    pages.getPage.mockResolvedValue(null);
    const putPages = {
      updatePageJson: jest.fn().mockResolvedValue({ _id: pageId, version: 3 }),
    };
    const putController = new PagesController(
      putPages as unknown as PagesService,
      projects as unknown as ProjectsService,
    );

    const res = await putController.updatePage(
      projectId,
      pageId,
      {
        page: { sections: [] },
        seoJson: { title: 'Updated SEO' },
        version: 2,
      },
      { user: { sub: ownerUserId, tenantId } },
    );

    expect(putPages.updatePageJson).toHaveBeenCalledWith({
      tenantId,
      projectId,
      pageId,
      page: {
        editorJson: { sections: [] },
        seoJson: { title: 'Updated SEO' },
      },
      version: 2,
    });
    expect(res).toEqual({ ok: true, data: { page_id: pageId, version: 3 } });
  });
});
