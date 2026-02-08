import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { NavigationDocument } from '../navigation/navigation.schema';
import { PageDocument } from '../pages/page.schema';
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
  updateMany: jest.Mock;
  updateOne: jest.Mock;
};

type MockNavigationModel = {
  findOne: jest.Mock;
};

describe('ProjectsService.setHomePage', () => {
  let service: ProjectsService;
  let projectModel: MockProjectModel;
  let pageModel: MockPageModel;
  let navigationModel: MockNavigationModel;

  beforeEach(() => {
    projectModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    pageModel = {
      findOne: jest.fn(),
      updateMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    navigationModel = {
      findOne: jest.fn(),
    };

    service = new ProjectsService(
      projectModel as unknown as Model<ProjectDocument>,
      pageModel as unknown as Model<PageDocument>,
      navigationModel as unknown as Model<NavigationDocument>,
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
