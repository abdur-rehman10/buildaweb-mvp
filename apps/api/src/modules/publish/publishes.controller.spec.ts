import { HttpException } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { PublishService } from './publish.service';
import { PublishesController } from './publishes.controller';

describe('PublishesController.listPublishes', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';

  let controller: PublishesController;
  let projects: { getByIdScoped: jest.Mock };
  let publish: { listByProjectScoped: jest.Mock };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn(),
    };

    publish = {
      listByProjectScoped: jest.fn(),
    };

    controller = new PublishesController(
      projects as unknown as ProjectsService,
      publish as unknown as PublishService,
    );
  });

  it('returns an empty list when there are no publishes', async () => {
    projects.getByIdScoped.mockResolvedValue({ _id: projectId });
    publish.listByProjectScoped.mockResolvedValue([]);

    const res = await controller.listPublishes(projectId, undefined, { user: { sub: ownerUserId, tenantId } });

    expect(publish.listByProjectScoped).toHaveBeenCalledWith({
      tenantId,
      projectId,
      ownerUserId,
      limit: 10,
    });
    expect(res).toEqual({
      ok: true,
      data: {
        publishes: [],
      },
    });
  });

  it('returns publishes sorted newest first (service-provided order)', async () => {
    const newest = new Date('2026-02-09T11:00:00.000Z');
    const older = new Date('2026-02-09T10:00:00.000Z');
    projects.getByIdScoped.mockResolvedValue({ _id: projectId });
    publish.listByProjectScoped.mockResolvedValue([
      {
        _id: 'publish-new',
        status: 'live',
        createdAt: newest,
        baseUrl: 'http://localhost:9000/path/new/',
      },
      {
        _id: 'publish-old',
        status: 'failed',
        createdAt: older,
        baseUrl: 'http://localhost:9000/path/old/',
      },
    ]);

    const res = await controller.listPublishes(projectId, '10', { user: { sub: ownerUserId, tenantId } });

    expect(res).toEqual({
      ok: true,
      data: {
        publishes: [
          {
            publishId: 'publish-new',
            status: 'live',
            createdAt: newest,
            baseUrl: 'http://localhost:9000/path/new/',
          },
          {
            publishId: 'publish-old',
            status: 'failed',
            createdAt: older,
            baseUrl: 'http://localhost:9000/path/old/',
          },
        ],
      },
    });
  });

  it('respects the provided limit query parameter', async () => {
    projects.getByIdScoped.mockResolvedValue({ _id: projectId });
    publish.listByProjectScoped.mockResolvedValue([]);

    await controller.listPublishes(projectId, '3', { user: { sub: ownerUserId, tenantId } });

    expect(publish.listByProjectScoped).toHaveBeenCalledWith({
      tenantId,
      projectId,
      ownerUserId,
      limit: 3,
    });
  });

  it('returns 404 when project scope check fails (unauthorized/not found)', async () => {
    projects.getByIdScoped.mockResolvedValue(null);

    await expect(
      controller.listPublishes(projectId, undefined, { user: { sub: ownerUserId, tenantId } }),
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
