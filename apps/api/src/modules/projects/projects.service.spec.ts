import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { NavigationDocument } from '../navigation/navigation.schema';
import { PageDocument } from '../pages/page.schema';
import { PublishDocument } from '../publish/publish.schema';
import { buildPublishDraftSnapshot } from '../publish/publish-snapshot.util';
import { ProjectDocument } from './project.schema';
import { ProjectsService } from './projects.service';

type MockProjectModel = {
  create: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  updateOne: jest.Mock;
};

type MockPageModel = {
  findOne: jest.Mock;
  find: jest.Mock;
  updateMany: jest.Mock;
  updateOne: jest.Mock;
};

type MockNavigationModel = {
  findOne: jest.Mock;
  find: jest.Mock;
};

type MockPublishModel = {
  find: jest.Mock;
};

describe('ProjectsService.setHomePage', () => {
  let service: ProjectsService;
  let projectModel: MockProjectModel;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;
  let publishModel: MockPublishModel;

  beforeEach(() => {
    projectModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    pageModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    navigationModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    publishModel = {
      find: jest.fn(),
    };

    service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      publishModel as unknown as Model<PublishDocument>,
    );
  });

  it('sets target page as home and moves it to first navigation item', async () => {
    pageModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        title: 'About',
      }),
    });

    const save = jest.fn().mockResolvedValue(undefined);
    const navigationDoc = {
      itemsJson: [
        { label: 'Home', pageId: '507f1f77bcf86cd799439010' },
        { label: 'About', pageId: '507f1f77bcf86cd799439011' },
      ],
      save,
    };
    navigationModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(navigationDoc),
    });

    const result = await service.setHomePage({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: '507f1f77bcf86cd799439100',
      pageId: '507f1f77bcf86cd799439011',
    });

    expect(pageModel.updateMany).toHaveBeenCalledWith(
      { tenantId: 'default', projectId: '507f1f77bcf86cd799439100' },
      { $set: { isHome: false } },
    );
    expect(pageModel.updateOne).toHaveBeenCalledWith(
      {
        _id: '507f1f77bcf86cd799439011',
        tenantId: 'default',
        projectId: '507f1f77bcf86cd799439100',
      },
      { $set: { isHome: true } },
    );
    expect(projectModel.updateOne).toHaveBeenCalledWith(
      {
        _id: '507f1f77bcf86cd799439100',
        tenantId: 'default',
        ownerUserId: 'user-1',
      },
      {
        $set: { homePageId: '507f1f77bcf86cd799439011' },
      },
    );
    expect(save).toHaveBeenCalledTimes(1);
    expect(navigationDoc.itemsJson).toEqual([
      { label: 'About', pageId: '507f1f77bcf86cd799439011' },
      { label: 'Home', pageId: '507f1f77bcf86cd799439010' },
    ]);
    expect(result).toEqual({ pageId: '507f1f77bcf86cd799439011' });
  });

  it("throws NotFoundException when page doesn't belong to project", async () => {
    pageModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.setHomePage({
        tenantId: 'default',
        ownerUserId: 'user-1',
        projectId: '507f1f77bcf86cd799439100',
        pageId: '507f1f77bcf86cd799439011',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(pageModel.updateMany).not.toHaveBeenCalled();
    expect(pageModel.updateOne).not.toHaveBeenCalled();
  });
});

describe('ProjectsService.settings', () => {
  let service: ProjectsService;
  let projectModel: MockProjectModel;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;
  let publishModel: MockPublishModel;

  beforeEach(() => {
    projectModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    pageModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    navigationModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    publishModel = {
      find: jest.fn(),
    };

    service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      publishModel as unknown as Model<PublishDocument>,
    );
  });

  it('returns mapped settings with locale fallback', async () => {
    projectModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'project-1',
        siteName: ' My Site ',
        logoAssetId: null,
        faviconAssetId: 'favicon-asset',
        defaultOgImageAssetId: '',
        locale: '',
        defaultLocale: 'en',
      }),
    });

    const settings = await service.getSettings({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: 'project-1',
    });

    expect(settings).toEqual({
      siteName: 'My Site',
      logoAssetId: null,
      faviconAssetId: 'favicon-asset',
      defaultOgImageAssetId: null,
      locale: 'en',
    });
  });

  it('updates settings with $set patch semantics and preserves homePageId', async () => {
    projectModel.findOne.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce({
          _id: 'project-1',
          siteName: 'Old Name',
          logoAssetId: null,
          faviconAssetId: null,
          defaultOgImageAssetId: null,
          locale: 'en',
          defaultLocale: 'en',
          homePageId: '507f1f77bcf86cd799439011',
        })
        .mockResolvedValueOnce({
          _id: 'project-1',
          siteName: 'New Name',
          logoAssetId: 'logo-asset',
          faviconAssetId: 'favicon-asset',
          defaultOgImageAssetId: 'og-asset',
          locale: 'fr',
          defaultLocale: 'en',
          homePageId: '507f1f77bcf86cd799439011',
        }),
    });

    const settings = await service.updateSettings({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: 'project-1',
      siteName: ' New Name ',
      logoAssetId: 'logo-asset',
      faviconAssetId: 'favicon-asset',
      defaultOgImageAssetId: 'og-asset',
      locale: 'fr',
    });

    expect(projectModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'project-1',
        tenantId: 'default',
        ownerUserId: 'user-1',
      },
      {
        $set: {
          siteName: 'New Name',
          logoAssetId: 'logo-asset',
          faviconAssetId: 'favicon-asset',
          defaultOgImageAssetId: 'og-asset',
          locale: 'fr',
        },
      },
    );
    expect(settings).toEqual({
      siteName: 'New Name',
      logoAssetId: 'logo-asset',
      faviconAssetId: 'favicon-asset',
      defaultOgImageAssetId: 'og-asset',
      locale: 'fr',
    });
  });

  it('throws when homePageId changes during settings update', async () => {
    projectModel.findOne.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValueOnce({
          _id: 'project-1',
          siteName: 'Old Name',
          logoAssetId: null,
          faviconAssetId: null,
          defaultOgImageAssetId: null,
          locale: 'en',
          defaultLocale: 'en',
          homePageId: '507f1f77bcf86cd799439011',
        })
        .mockResolvedValueOnce({
          _id: 'project-1',
          siteName: 'New Name',
          logoAssetId: null,
          faviconAssetId: null,
          defaultOgImageAssetId: null,
          locale: 'en',
          defaultLocale: 'en',
          homePageId: '507f1f77bcf86cd799439012',
        }),
    });

    await expect(
      service.updateSettings({
        tenantId: 'default',
        ownerUserId: 'user-1',
        projectId: 'project-1',
        siteName: 'New Name',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe('ProjectsService.draftStatus', () => {
  let service: ProjectsService;
  let projectModel: MockProjectModel;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;
  let publishModel: MockPublishModel;

  beforeEach(() => {
    projectModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    pageModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateMany: jest.fn(),
      updateOne: jest.fn(),
    };

    navigationModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    publishModel = {
      find: jest.fn(),
    };

    service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
      publishModel as unknown as Model<PublishDocument>,
    );
  });

  it('marks project as having unpublished changes when latestPublishId is null', async () => {
    projectModel.find.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: '507f1f77bcf86cd799439100',
          name: 'Main',
          defaultLocale: 'en',
          latestPublishId: null,
        },
      ]),
    });
    pageModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    navigationModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    publishModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });

    const result = await service.listByOwnerWithDraftStatus({ tenantId: 'default', ownerUserId: 'user-1' });
    expect(result).toEqual([
      {
        project: expect.objectContaining({ _id: '507f1f77bcf86cd799439100' }),
        hasUnpublishedChanges: true,
      },
    ]);
  });

  it('marks project up to date when current draft matches latest publish snapshot', async () => {
    const projectId = '507f1f77bcf86cd799439100';
    const publishId = '507f1f77bcf86cd799439200';
    const pageId = '507f1f77bcf86cd799439011';
    const pages = [
      {
        _id: pageId,
        projectId,
        title: 'Home',
        slug: '/',
        isHome: true,
        editorJson: { sections: [{ blocks: [{ nodes: [{ type: 'text', content: 'Hello' }] }] }] },
        seoJson: { title: 'Home' },
      },
    ];
    const navigationItems = [{ label: 'Home', pageId }];
    const draftSnapshot = buildPublishDraftSnapshot({
      project: {
        defaultLocale: 'en',
        locale: 'en',
        siteName: 'Main',
        faviconAssetId: null,
        defaultOgImageAssetId: null,
      },
      pages,
      navigationItems,
    });

    projectModel.find.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: projectId,
          defaultLocale: 'en',
          locale: 'en',
          siteName: 'Main',
          faviconAssetId: null,
          defaultOgImageAssetId: null,
          latestPublishId: publishId,
        },
      ]),
    });
    pageModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(pages),
    });
    navigationModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ projectId, itemsJson: navigationItems }]),
    });
    publishModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: publishId, draftSnapshot }]),
    });

    const result = await service.listByOwnerWithDraftStatus({ tenantId: 'default', ownerUserId: 'user-1' });
    expect(result).toEqual([
      {
        project: expect.objectContaining({ _id: projectId }),
        hasUnpublishedChanges: false,
      },
    ]);
  });
});
