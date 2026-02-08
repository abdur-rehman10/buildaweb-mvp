import { HttpException, NotFoundException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController.setProjectHomePage', () => {
  let controller: ProjectsController;
  let projects: {
    getByIdScoped: jest.Mock;
    setHomePage: jest.Mock;
  };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn(),
      setHomePage: jest.fn(),
    };

    controller = new ProjectsController(projects as unknown as ProjectsService);
  });

  it('returns ok response when home page is set', async () => {
    projects.getByIdScoped.mockResolvedValue({ _id: '507f1f77bcf86cd799439100' });
    projects.setHomePage.mockResolvedValue({ pageId: '507f1f77bcf86cd799439011' });

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
    projects.getByIdScoped.mockResolvedValue({ _id: '507f1f77bcf86cd799439100' });
    projects.setHomePage.mockRejectedValue(new NotFoundException('Page not found'));

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
    getByIdScoped: jest.Mock;
    setHomePage: jest.Mock;
  };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn(),
      setHomePage: jest.fn(),
    };

    controller = new ProjectsController(projects as unknown as ProjectsService);
  });

  it('returns latest publish fields when present', async () => {
    const publishedAt = new Date('2026-02-08T10:30:00.000Z');
    projects.getByIdScoped.mockResolvedValue({
      _id: '507f1f77bcf86cd799439100',
      name: 'Main Site',
      status: 'published',
      defaultLocale: 'en',
      latestPublishId: '507f1f77bcf86cd799439200',
      publishedAt,
      createdAt: new Date('2026-02-08T09:00:00.000Z'),
      updatedAt: new Date('2026-02-08T10:30:00.000Z'),
    });

    const result = await controller.getProject('507f1f77bcf86cd799439100', {
      user: { sub: 'user-1', tenantId: 'default' },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        project: expect.objectContaining({
          id: '507f1f77bcf86cd799439100',
          latestPublishId: '507f1f77bcf86cd799439200',
          publishedAt,
        }),
      },
    });
  });

  it('returns null latest publish fields when not published', async () => {
    projects.getByIdScoped.mockResolvedValue({
      _id: '507f1f77bcf86cd799439100',
      name: 'Draft Site',
      status: 'draft',
      defaultLocale: 'en',
      latestPublishId: null,
      publishedAt: null,
      createdAt: new Date('2026-02-08T09:00:00.000Z'),
      updatedAt: new Date('2026-02-08T09:05:00.000Z'),
    });

    const result = await controller.getProject('507f1f77bcf86cd799439100', {
      user: { sub: 'user-1', tenantId: 'default' },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        project: expect.objectContaining({
          latestPublishId: null,
          publishedAt: null,
        }),
      },
    });
  });
});
