import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Navigation, NavigationDocument } from '../navigation/navigation.schema';
import { Page, PageDocument } from '../pages/page.schema';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Navigation.name) private readonly navigationModel: Model<NavigationDocument>,
  ) {}

  async create(params: { tenantId: string; ownerUserId: string; name: string; defaultLocale: string }) {
    return this.projectModel.create({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      name: params.name,
      defaultLocale: params.defaultLocale,
      status: 'draft',
    });
  }

  async listByOwner(params: { tenantId: string; ownerUserId: string }) {
    return this.projectModel.find({ tenantId: params.tenantId, ownerUserId: params.ownerUserId }).exec();
  }

  async getByIdScoped(params: { tenantId: string; ownerUserId: string; projectId: string }) {
    return this.projectModel
      .findOne({ _id: params.projectId, tenantId: params.tenantId, ownerUserId: params.ownerUserId })
      .exec();
  }

  async setLatestPublish(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    publishId: string;
    publishedAt: Date;
  }) {
    return this.projectModel
      .findOneAndUpdate(
        {
          _id: params.projectId,
          tenantId: params.tenantId,
          ownerUserId: params.ownerUserId,
        },
        {
          $set: {
            latestPublishId: params.publishId,
            publishedAt: params.publishedAt,
          },
        },
        { new: true },
      )
      .exec();
  }

  async setHomePage(params: { tenantId: string; ownerUserId: string; projectId: string; pageId: string }) {
    if (!Types.ObjectId.isValid(params.pageId)) {
      throw new NotFoundException('Page not found');
    }

    const targetPage = await this.pageModel
      .findOne({
        _id: params.pageId,
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .select('_id title')
      .lean()
      .exec();

    if (!targetPage) {
      throw new NotFoundException('Page not found');
    }

    await this.pageModel
      .updateMany(
        {
          tenantId: params.tenantId,
          projectId: params.projectId,
        },
        {
          $set: { isHome: false },
        },
      )
      .exec();

    await this.pageModel
      .updateOne(
        {
          _id: params.pageId,
          tenantId: params.tenantId,
          projectId: params.projectId,
        },
        {
          $set: { isHome: true },
        },
      )
      .exec();

    await this.projectModel
      .updateOne(
        {
          _id: params.projectId,
          tenantId: params.tenantId,
          ownerUserId: params.ownerUserId,
        },
        {
          $set: { homePageId: params.pageId },
        },
      )
      .exec();

    const navigation = await this.navigationModel
      .findOne({
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
      })
      .exec();

    if (navigation) {
      const currentItems = Array.isArray(navigation.itemsJson) ? navigation.itemsJson : [];
      const existingTarget = currentItems.find((item) => item.pageId === params.pageId);
      const remainingItems = currentItems.filter((item) => item.pageId !== params.pageId);

      navigation.itemsJson = [
        existingTarget ?? { label: targetPage.title, pageId: params.pageId },
        ...remainingItems,
      ];

      await navigation.save();
    }

    return {
      pageId: String(targetPage._id),
    };
  }
}
