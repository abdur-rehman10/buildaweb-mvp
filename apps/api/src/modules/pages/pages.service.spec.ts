import { ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { NavigationDocument } from '../navigation/navigation.schema';
import { ProjectDocument } from '../projects/project.schema';
import { PageDocument } from './page.schema';
import { PagesService } from './pages.service';

type MockPageModel = {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  create: jest.Mock;
  countDocuments: jest.Mock;
  deleteOne: jest.Mock;
  updateMany: jest.Mock;
  updateOne: jest.Mock;
};

type MockNavigationModel = {
  updateMany: jest.Mock;
};

type MockProjectModel = {
  updateOne: jest.Mock;
};

function createSelectQueryMock<T>(value: T) {
  return {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createFindOneWithSortMock<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('PagesService', () => {
  let service: PagesService;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;
  let projectModel: MockProjectModel;

  beforeEach(() => {
    pageModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      deleteOne: jest.fn(),
      updateMany: jest.fn(),
      updateOne: jest.fn(),
    };

    navigationModel = {
      updateMany: jest.fn(),
    };

    projectModel = {
      updateOne: jest.fn(),
    };

    service = new PagesService(
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      projectModel as unknown as Model<ProjectDocument>,
    );
  });

  describe('duplicatePage', () => {
    it('duplicates page content and uses "-copy" slug when available', async () => {
      const sourcePage = {
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
        title: 'Home',
        slug: 'home',
        isHome: true,
        editorJson: { sections: [{ id: 'section-1' }] },
        seoJson: { title: 'SEO' },
        version: 4,
      };

      pageModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter._id === 'page-1') {
          return {
            exec: jest.fn().mockResolvedValue(sourcePage),
          };
        }

        if (filter.slug === 'home-copy') {
          return createSelectQueryMock(null);
        }

        throw new Error(`Unexpected findOne filter: ${JSON.stringify(filter)}`);
      });

      pageModel.create.mockImplementation(async (payload: Record<string, unknown>) => ({
        _id: 'page-2',
        ...payload,
      }));

      const duplicated = await service.duplicatePage({
        tenantId: 'default',
        projectId: 'project-1',
        pageId: 'page-1',
      });

      expect(duplicated.slug).toBe('home-copy');
      expect(pageModel.create).toHaveBeenCalledTimes(1);

      const createPayload = pageModel.create.mock.calls[0][0] as Record<string, unknown>;
      expect(createPayload.title).toBe(sourcePage.title);
      expect(createPayload.isHome).toBe(false);
      expect(createPayload.version).toBe(1);
      expect(createPayload.editorJson).toEqual(sourcePage.editorJson);
      expect(createPayload.seoJson).toEqual(sourcePage.seoJson);
      expect(createPayload.editorJson).not.toBe(sourcePage.editorJson);
      expect(createPayload.seoJson).not.toBe(sourcePage.seoJson);
    });

    it('increments copy suffix when "-copy" slug already exists', async () => {
      const sourcePage = {
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
        title: 'Home',
        slug: 'home',
        editorJson: {},
        seoJson: {},
      };

      pageModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter._id === 'page-1') {
          return {
            exec: jest.fn().mockResolvedValue(sourcePage),
          };
        }

        if (filter.slug === 'home-copy') {
          return createSelectQueryMock({ _id: 'existing-1' });
        }

        if (filter.slug === 'home-copy-2') {
          return createSelectQueryMock({ _id: 'existing-2' });
        }

        if (filter.slug === 'home-copy-3') {
          return createSelectQueryMock(null);
        }

        throw new Error(`Unexpected findOne filter: ${JSON.stringify(filter)}`);
      });

      pageModel.create.mockImplementation(async (payload: Record<string, unknown>) => ({
        _id: 'page-3',
        ...payload,
      }));

      const duplicated = await service.duplicatePage({
        tenantId: 'default',
        projectId: 'project-1',
        pageId: 'page-1',
      });

      expect(duplicated.slug).toBe('home-copy-3');
      expect(pageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'home-copy-3',
        }),
      );
    });
  });

  describe('updatePageJson', () => {
    it('updates editor json, increments version, and bumps updatedAt', async () => {
      const updatedDoc = {
        _id: 'page-1',
        version: 2,
      };

      pageModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await service.updatePageJson({
        tenantId: 'default',
        projectId: 'project-1',
        pageId: 'page-1',
        page: {
          editorJson: { sections: [] },
        },
        version: 1,
      });

      expect(result).toBe(updatedDoc);
      expect(pageModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: 'page-1',
          tenantId: 'default',
          projectId: 'project-1',
          version: 1,
        },
        {
          $set: {
            editorJson: { sections: [] },
          },
          $currentDate: { updatedAt: true },
          $inc: { version: 1 },
        },
        { new: true },
      );
    });
  });

  describe('deletePage', () => {
    it('deletes the page and updates navigation/home when deleting the home page', async () => {
      const existingPage = {
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
        slug: '/',
        isHome: true,
        version: 3,
      };

      const earliestRemainingPage = {
        _id: 'page-2',
      };

      pageModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter._id === 'page-1') {
          return {
            exec: jest.fn().mockResolvedValue(existingPage),
          };
        }

        if (!filter._id && filter.tenantId === 'default' && filter.projectId === 'project-1') {
          return createFindOneWithSortMock(earliestRemainingPage);
        }

        throw new Error(`Unexpected findOne filter: ${JSON.stringify(filter)}`);
      });

      pageModel.countDocuments.mockResolvedValue(2);
      pageModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
      pageModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
      pageModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
      navigationModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
      projectModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });

      await service.deletePage({
        tenantId: 'default',
        projectId: 'project-1',
        pageId: 'page-1',
        version: 3,
      });

      expect(pageModel.deleteOne).toHaveBeenCalledWith({
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
      });
      expect(navigationModel.updateMany).toHaveBeenCalledWith(
        {
          tenantId: 'default',
          projectId: 'project-1',
        },
        {
          $pull: {
            itemsJson: { pageId: 'page-1' },
          },
        },
      );
      expect(pageModel.updateMany).toHaveBeenCalledWith(
        {
          tenantId: 'default',
          projectId: 'project-1',
        },
        {
          $set: { isHome: false },
        },
      );
      expect(pageModel.updateOne).toHaveBeenCalledWith(
        {
          _id: 'page-2',
          tenantId: 'default',
          projectId: 'project-1',
        },
        {
          $set: { isHome: true },
        },
      );
      expect(projectModel.updateOne).toHaveBeenCalledWith(
        {
          _id: 'project-1',
          tenantId: 'default',
        },
        {
          $set: {
            homePageId: 'page-2',
          },
        },
      );
    });

    it('throws conflict when provided version does not match stored version', async () => {
      const existingPage = {
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
        slug: '/',
        isHome: true,
        version: 5,
      };

      pageModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingPage),
      });

      await expect(
        service.deletePage({
          tenantId: 'default',
          projectId: 'project-1',
          pageId: 'page-1',
          version: 4,
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(pageModel.deleteOne).not.toHaveBeenCalled();
      expect(navigationModel.updateMany).not.toHaveBeenCalled();
    });

    it('sets project.homePageId to null if deleted home has no replacement page', async () => {
      const existingPage = {
        _id: 'page-1',
        tenantId: 'default',
        projectId: 'project-1',
        slug: '/',
        isHome: true,
        version: 2,
      };

      pageModel.findOne.mockImplementation((filter: Record<string, unknown>) => {
        if (filter._id === 'page-1') {
          return {
            exec: jest.fn().mockResolvedValue(existingPage),
          };
        }

        if (!filter._id && filter.tenantId === 'default' && filter.projectId === 'project-1') {
          return createFindOneWithSortMock(null);
        }

        throw new Error(`Unexpected findOne filter: ${JSON.stringify(filter)}`);
      });

      pageModel.countDocuments.mockResolvedValue(2);
      pageModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
      pageModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
      navigationModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });
      projectModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });

      await service.deletePage({
        tenantId: 'default',
        projectId: 'project-1',
        pageId: 'page-1',
        version: 2,
      });

      expect(projectModel.updateOne).toHaveBeenCalledWith(
        {
          _id: 'project-1',
          tenantId: 'default',
        },
        {
          $set: {
            homePageId: null,
          },
        },
      );
    });
  });
});
