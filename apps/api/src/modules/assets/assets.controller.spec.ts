import { HttpException } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { ProjectsService } from '../projects/projects.service';

describe('AssetsController.list', () => {
  let controller: AssetsController;
  let assets: { listByProjectScoped: jest.Mock };
  let projects: { getByIdScoped: jest.Mock };

  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    assets = {
      listByProjectScoped: jest.fn(),
    };

    projects = {
      getByIdScoped: jest.fn(),
    };

    controller = new AssetsController(
      assets as unknown as AssetsService,
      projects as unknown as ProjectsService,
    );
  });

  it('returns ok true with empty assets array when no assets exist', async () => {
    projects.getByIdScoped.mockResolvedValue({ _id: projectId });
    assets.listByProjectScoped.mockResolvedValue([]);

    const result = await controller.list(projectId, {
      user: { sub: ownerUserId, tenantId },
    });

    expect(result).toEqual({ ok: true, data: { assets: [] } });
  });

  it('returns asset metadata fields when assets exist', async () => {
    const createdAt = new Date('2026-02-08T08:00:00.000Z');
    projects.getByIdScoped.mockResolvedValue({ _id: projectId });
    assets.listByProjectScoped.mockResolvedValue([
      {
        id: '507f1f77bcf86cd799439021',
        fileName: 'hero.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
        publicUrl: 'http://localhost:9000/bucket/hero.jpg',
        createdAt,
      },
    ]);

    const result = await controller.list(projectId, {
      user: { sub: ownerUserId, tenantId },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        assets: [
          {
            id: '507f1f77bcf86cd799439021',
            fileName: 'hero.jpg',
            mimeType: 'image/jpeg',
            size: 12345,
            publicUrl: 'http://localhost:9000/bucket/hero.jpg',
            createdAt,
          },
        ],
      },
    });
  });

  it('returns NOT_FOUND when project is not owned by the user', async () => {
    projects.getByIdScoped.mockResolvedValue(null);

    await expect(
      controller.list(projectId, {
        user: { sub: ownerUserId, tenantId },
      }),
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

  it('returns INVALID_PROJECT_ID for malformed projectId', async () => {
    await expect(
      controller.list('bad-project-id', {
        user: { sub: ownerUserId, tenantId },
      }),
    ).rejects.toMatchObject({
      status: 400,
      response: {
        ok: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project id',
        },
      },
    } as Partial<HttpException>);
  });
});
