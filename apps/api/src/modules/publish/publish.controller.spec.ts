import { HttpException } from '@nestjs/common';
import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';
import { ProjectsService } from '../projects/projects.service';

describe('PublishController', () => {
  const tenantId = 'default';
  const ownerUserId = 'user-1';
  const projectId = '507f1f77bcf86cd799439011';

  let controller: PublishController;
  let projects: { getByIdScoped: jest.Mock; setLatestPublish: jest.Mock };
  let publish: { getByIdScoped: jest.Mock };

  beforeEach(() => {
    projects = {
      getByIdScoped: jest.fn(),
      setLatestPublish: jest.fn(),
    };

    publish = {
      getByIdScoped: jest.fn(),
    };

    controller = new PublishController(
      projects as unknown as ProjectsService,
      publish as unknown as PublishService,
    );
  });

  describe('getLatestPublish', () => {
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

  describe('setLatestPublish', () => {
    it('updates latestPublishId when publishId is valid and scoped to project', async () => {
      const now = new Date('2026-02-09T10:30:00.000Z');
      jest.useFakeTimers().setSystemTime(now);

      projects.getByIdScoped.mockResolvedValue({
        _id: projectId,
      });
      publish.getByIdScoped.mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        projectId,
      });
      projects.setLatestPublish.mockResolvedValue({
        _id: projectId,
        name: 'Site',
        status: 'published',
        defaultLocale: 'en',
        latestPublishId: '507f1f77bcf86cd799439099',
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const res = await controller.setLatestPublish(
        projectId,
        { publishId: '507f1f77bcf86cd799439099' },
        { user: { sub: ownerUserId, tenantId } },
      );

      expect(projects.setLatestPublish).toHaveBeenCalledWith({
        tenantId,
        ownerUserId,
        projectId,
        publishId: '507f1f77bcf86cd799439099',
        publishedAt: now,
      });
      expect(res).toEqual({
        ok: true,
        data: {
          project: {
            id: projectId,
            name: 'Site',
            status: 'published',
            defaultLocale: 'en',
            latestPublishId: '507f1f77bcf86cd799439099',
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
          },
        },
      });

      jest.useRealTimers();
    });

    it('rejects publishId from another project/scope with 404', async () => {
      projects.getByIdScoped.mockResolvedValue({ _id: projectId });
      publish.getByIdScoped.mockResolvedValue(null);

      await expect(
        controller.setLatestPublish(
          projectId,
          { publishId: '507f1f77bcf86cd799439099' },
          { user: { sub: ownerUserId, tenantId } },
        ),
      ).rejects.toMatchObject({
        status: 404,
        response: {
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Not found' },
        },
      } as Partial<HttpException>);

      expect(projects.setLatestPublish).not.toHaveBeenCalled();
    });

    it('returns 400 when publishId is missing in body', async () => {
      await expect(
        controller.setLatestPublish(
          projectId,
          { publishId: '' },
          { user: { sub: ownerUserId, tenantId } },
        ),
      ).rejects.toMatchObject({
        status: 400,
        response: {
          ok: false,
          error: { code: 'BAD_REQUEST', message: 'publishId is required' },
        },
      } as Partial<HttpException>);
    });

    it('returns 404 when project is not found', async () => {
      projects.getByIdScoped.mockResolvedValue(null);

      await expect(
        controller.setLatestPublish(
          projectId,
          { publishId: '507f1f77bcf86cd799439099' },
          { user: { sub: ownerUserId, tenantId } },
        ),
      ).rejects.toMatchObject({
        status: 404,
        response: {
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Not found' },
        },
      } as Partial<HttpException>);

      expect(publish.getByIdScoped).not.toHaveBeenCalled();
      expect(projects.setLatestPublish).not.toHaveBeenCalled();
    });
  });
});
