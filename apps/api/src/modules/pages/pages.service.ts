import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './page.schema';

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>) {}

  async createPage(params: { tenantId: string; projectId: string; title: string; slug: string; isHome?: boolean }) {
    return this.pageModel.create({
      tenantId: params.tenantId,
      projectId: params.projectId,
      title: params.title,
      slug: params.slug.toLowerCase(),
      isHome: params.isHome ?? false,
      editorJson: {},
      seoJson: {},
      version: 1,
    });
  }

  async listPages(params: { tenantId: string; projectId: string }) {
    const pages = await this.pageModel
      .find({ tenantId: params.tenantId, projectId: params.projectId })
      .select('_id title slug isHome updatedAt version')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return pages.map((page) => ({
      id: String(page._id),
      title: page.title,
      slug: page.slug,
      isHome: page.isHome,
      updatedAt: page.updatedAt,
      version: page.version,
    }));
  }

  async getPage(params: { tenantId: string; projectId: string; pageId: string }) {
    return this.pageModel
      .findOne({ _id: params.pageId, tenantId: params.tenantId, projectId: params.projectId })
      .select('_id title slug isHome editorJson seoJson version updatedAt createdAt')
      .exec();
  }

  async updatePageJson(params: {
    tenantId: string;
    projectId: string;
    pageId: string;
    page: { editorJson: unknown; seoJson?: unknown };
    version: number;
  }) {
    const setPayload: Record<string, unknown> = {
      editorJson: params.page.editorJson,
    };

    if (Object.prototype.hasOwnProperty.call(params.page, 'seoJson')) {
      setPayload.seoJson = params.page.seoJson;
    }

    const updated = await this.pageModel
      .findOneAndUpdate(
        {
          _id: params.pageId,
          tenantId: params.tenantId,
          projectId: params.projectId,
          version: params.version,
        },
        {
          $set: setPayload,
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (updated) {
      return updated;
    }

    const existing = await this.pageModel
      .findOne({ _id: params.pageId, tenantId: params.tenantId, projectId: params.projectId })
      .select('_id version')
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException('Page not found');
    }

    throw new ConflictException('Page version mismatch');
  }
}
