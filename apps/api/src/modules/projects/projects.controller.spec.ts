import {
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController.createProject', () => {
  let controller: ProjectsController;
  let projects: {
    create: jest.Mock;
    getByIdScoped: jest.Mock;
    getByIdScopedWithDraftStatus: jest.Mock;
    listByOwnerWithDraftStatus: jest.Mock;
    setHomePage: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    createFromPrompt: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(() => {
    projects = {
      create: jest.fn(),
      getByIdScoped: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      listByOwnerWithDraftStatus: jest.fn(),
      setHomePage: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      createFromPrompt: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('http://13.50.101.211') };

    controller = new ProjectsController(
      projects as unknown as ProjectsService,
      config as unknown as ConfigService,
    );
  });

  it('returns project id when project is created', async () => {
    projects.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439100' });

    const result = await controller.createProject(
      { name: 'Main site', defaultLocale: 'en' },
      { user: { sub: 'user-1', tenantId: 'default' } },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        project_id: '507f1f77bcf86cd799439100',
      },
    });
  });

  it('returns PROJECT_ALREADY_EXISTS when user already has a project', async () => {
    projects.create.mockRejectedValue(
      new ForbiddenException('User already has a project'),
    );

    await expect(
      controller.createProject(
        { name: 'Second site', defaultLocale: 'en' },
        { user: { sub: 'user-1', tenantId: 'default' } },
      ),
    ).rejects.toMatchObject({
      status: 403,
      response: {
        ok: false,
        error: {
          code: 'PROJECT_ALREADY_EXISTS',
          message: 'User already has a project',
        },
      },
    } as Partial<HttpException>);
  });
});

describe('ProjectsController.setProjectHomePage', () => {
  let controller: ProjectsController;
  let projects: {
    create: jest.Mock;
    getByIdScoped: jest.Mock;
    getByIdScopedWithDraftStatus: jest.Mock;
    listByOwnerWithDraftStatus: jest.Mock;
    setHomePage: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    createFromPrompt: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(() => {
    projects = {
      create: jest.fn(),
      getByIdScoped: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      listByOwnerWithDraftStatus: jest.fn(),
      setHomePage: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      createFromPrompt: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('http://13.50.101.211') };

    controller = new ProjectsController(
      projects as unknown as ProjectsService,
      config as unknown as ConfigService,
    );
  });

  it('returns ok response when home page is set', async () => {
    projects.getByIdScoped.mockResolvedValue({
      _id: '507f1f77bcf86cd799439100',
    });
    projects.setHomePage.mockResolvedValue({
      pageId: '507f1f77bcf86cd799439011',
    });

    const result = await controller.setProjectHomePage(
      '507f1f77bcf86cd799439100',
      { pageId: '507f1f77bcf86cd799439011' },
      { user: { sub: 'user-1', tenantId: 'default' } },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        homePageId: '507f1f77bcf86cd799439011',
        slug: '/',
      },
    });
  });

  it('returns NOT_FOUND when pageId does not belong to project', async () => {
    projects.getByIdScoped.mockResolvedValue({
      _id: '507f1f77bcf86cd799439100',
    });
    projects.setHomePage.mockRejectedValue(
      new NotFoundException('Page not found'),
    );

    await expect(
      controller.setProjectHomePage(
        '507f1f77bcf86cd799439100',
        { pageId: '507f1f77bcf86cd799439011' },
        { user: { sub: 'user-1', tenantId: 'default' } },
      ),
    ).rejects.toMatchObject({
      status: 404,
      response: {
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      },
    } as Partial<HttpException>);
  });
});

describe('ProjectsController.getProject', () => {
  let controller: ProjectsController;
  let projects: {
    create: jest.Mock;
    getByIdScoped: jest.Mock;
    getByIdScopedWithDraftStatus: jest.Mock;
    listByOwnerWithDraftStatus: jest.Mock;
    setHomePage: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    createFromPrompt: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(() => {
    projects = {
      create: jest.fn(),
      getByIdScoped: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      listByOwnerWithDraftStatus: jest.fn(),
      setHomePage: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      createFromPrompt: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('http://13.50.101.211') };

    controller = new ProjectsController(
      projects as unknown as ProjectsService,
      config as unknown as ConfigService,
    );
  });

  it('returns latest publish fields when present', async () => {
    const publishedAt = new Date('2026-02-08T10:30:00.000Z');
    projects.getByIdScopedWithDraftStatus.mockResolvedValue({
      project: {
        _id: '507f1f77bcf86cd799439100',
        name: 'Main Site',
        status: 'published',
        defaultLocale: 'en',
        homePageId: '507f1f77bcf86cd799439011',
        latestPublishId: '507f1f77bcf86cd799439200',
        publishedAt,
        createdAt: new Date('2026-02-08T09:00:00.000Z'),
        updatedAt: new Date('2026-02-08T10:30:00.000Z'),
      },
      hasUnpublishedChanges: false,
    });

    const result = await controller.getProject('507f1f77bcf86cd799439100', {
      user: { sub: 'user-1', tenantId: 'default' },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        project: expect.objectContaining({
          id: '507f1f77bcf86cd799439100',
          homePageId: '507f1f77bcf86cd799439011',
          latestPublishId: '507f1f77bcf86cd799439200',
          publishedAt,
          hasUnpublishedChanges: false,
        }),
      },
    });
  });

  it('returns null latest publish fields when not published', async () => {
    projects.getByIdScopedWithDraftStatus.mockResolvedValue({
      project: {
        _id: '507f1f77bcf86cd799439100',
        name: 'Draft Site',
        status: 'draft',
        defaultLocale: 'en',
        homePageId: null,
        latestPublishId: null,
        publishedAt: null,
        createdAt: new Date('2026-02-08T09:00:00.000Z'),
        updatedAt: new Date('2026-02-08T09:05:00.000Z'),
      },
      hasUnpublishedChanges: true,
    });

    const result = await controller.getProject('507f1f77bcf86cd799439100', {
      user: { sub: 'user-1', tenantId: 'default' },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        project: expect.objectContaining({
          homePageId: null,
          latestPublishId: null,
          publishedAt: null,
          hasUnpublishedChanges: true,
        }),
      },
    });
  });
});

describe('ProjectsController.settings', () => {
  let controller: ProjectsController;
  let projects: {
    create: jest.Mock;
    getByIdScoped: jest.Mock;
    getByIdScopedWithDraftStatus: jest.Mock;
    listByOwnerWithDraftStatus: jest.Mock;
    setHomePage: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    createFromPrompt: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(() => {
    projects = {
      create: jest.fn(),
      getByIdScoped: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      listByOwnerWithDraftStatus: jest.fn(),
      setHomePage: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      createFromPrompt: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('http://13.50.101.211') };

    controller = new ProjectsController(
      projects as unknown as ProjectsService,
      config as unknown as ConfigService,
    );
  });

  it('returns project settings', async () => {
    projects.getSettings.mockResolvedValue({
      siteName: 'Site Name',
      logoAssetId: 'asset-logo',
      faviconAssetId: 'asset-favicon',
      defaultOgImageAssetId: 'asset-og',
      locale: 'en',
    });

    const result = await controller.getProjectSettings(
      '507f1f77bcf86cd799439100',
      {
        user: { sub: 'user-1', tenantId: 'default' },
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        settings: {
          siteName: 'Site Name',
          logoAssetId: 'asset-logo',
          faviconAssetId: 'asset-favicon',
          defaultOgImageAssetId: 'asset-og',
          locale: 'en',
        },
      },
    });
  });

  it('updates project settings', async () => {
    projects.updateSettings.mockResolvedValue({
      siteName: 'Updated Site',
      logoAssetId: null,
      faviconAssetId: 'asset-favicon',
      defaultOgImageAssetId: null,
      locale: 'fr',
    });

    const result = await controller.updateProjectSettings(
      '507f1f77bcf86cd799439100',
      {
        siteName: 'Updated Site',
        faviconAssetId: 'asset-favicon',
        locale: 'fr',
      },
      { user: { sub: 'user-1', tenantId: 'default' } },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        settings: {
          siteName: 'Updated Site',
          logoAssetId: null,
          faviconAssetId: 'asset-favicon',
          defaultOgImageAssetId: null,
          locale: 'fr',
        },
      },
    });
  });
});

describe('ProjectsController.generateProject', () => {
  let controller: ProjectsController;
  let projects: {
    create: jest.Mock;
    getByIdScoped: jest.Mock;
    getByIdScopedWithDraftStatus: jest.Mock;
    listByOwnerWithDraftStatus: jest.Mock;
    setHomePage: jest.Mock;
    getSettings: jest.Mock;
    updateSettings: jest.Mock;
    createFromPrompt: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(() => {
    projects = {
      create: jest.fn(),
      getByIdScoped: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      listByOwnerWithDraftStatus: jest.fn(),
      setHomePage: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      createFromPrompt: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('http://13.50.101.211') };

    controller = new ProjectsController(
      projects as unknown as ProjectsService,
      config as unknown as ConfigService,
    );
  });

  it('generates site and returns previewUrl', async () => {
    projects.createFromPrompt.mockResolvedValue({
      homePageId: '507f1f77bcf86cd799439011',
      pageCount: 2,
    });

    const result = await controller.generateProject(
      '507f1f77bcf86cd799439100',
      { prompt: 'Generate a portfolio website' },
      { user: { sub: 'user-1', tenantId: 'default' } },
    );

    expect(projects.createFromPrompt).toHaveBeenCalledWith({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: '507f1f77bcf86cd799439100',
      prompt: 'Generate a portfolio website',
    });
    expect(result).toEqual({
      ok: true,
      data: {
        success: true,
        projectId: '507f1f77bcf86cd799439100',
        previewUrl: 'http://13.50.101.211/editor/507f1f77bcf86cd799439100',
      },
    });
  });
});
