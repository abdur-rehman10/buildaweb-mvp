import { HttpException } from '@nestjs/common';
import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';
import { ProjectsService } from '../projects/projects.service';

describe('PublishController.getLatestPublish', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';

  let controller: PublishController;
  let projects: { getByIdScoped: jest.Mock };
  let publish: { getByIdScoped: jest.Mock };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn(),
    };

    publish = {
      getByIdScoped: jest.fn(),
    };

    controller = new PublishController(
      projects as unknown as ProjectsService,
      publish as unknown as PublishService,
    );
  });

  it('returns latest publish record when latestPublishId is set', async () => {
    const timestamp = new Date('2026-02-08T12:00:00.000Z');
    projects.getByIdScoped.mockResolvedValue({
      _id: projectId,
      latestPublishId: '507f1f77bcf86cd799439055',
    });
    publish.getByIdScoped.mockResolvedValue({
      _id: '507f1f77bcf86cd799439055',
      status: 'live',
      baseUrl: 'http://localhost:9000/buildaweb/path/',
      updatedAt: timestamp,
      createdAt: timestamp,
    });

    const res = await controller.getLatestPublish(projectId, { user: { sub: ownerUserId, tenantId } });

    expect(publish.getByIdScoped).toHaveBeenCalledWith({
      tenantId,
      projectId,
      ownerUserId,
      publishId: '507f1f77bcf86cd799439055',
    });
    expect(res).toEqual({
      ok: true,
      data: {
        publishId: '507f1f77bcf86cd799439055',
        status: 'live',
        url: 'http://localhost:9000/buildaweb/path/',
        timestamp,
      },
    });
  });

  it('returns null data when latestPublishId is not set', async () => {
    projects.getByIdScoped.mockResolvedValue({
      _id: projectId,
      latestPublishId: null,
    });

    const res = await controller.getLatestPublish(projectId, { user: { sub: ownerUserId, tenantId } });

    expect(publish.getByIdScoped).not.toHaveBeenCalled();
    expect(res).toEqual({
      ok: true,
      data: null,
    });
  });

  it('returns 404 when project is not found', async () => {
    projects.getByIdScoped.mockResolvedValue(null);

    await expect(
      controller.getLatestPublish(projectId, { user: { sub: ownerUserId, tenantId } }),
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
