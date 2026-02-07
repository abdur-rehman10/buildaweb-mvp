import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './page.schema';

export class PageSlugConflictException extends ConflictException {}
export class LastPageForbiddenException extends ConflictException {}

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private readonly pageModel: Model<PageDocument>) {}

  private normalizeSlug(slug: string) {
    return slug.trim().toLowerCase();
  }

  private cloneJson(value: unknown): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {};
    }
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  private isDuplicateKeyError(error: unknown) {
    return !!(error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000);
  }

  private async ensureSlugAvailable(params: {
    tenantId: string;
    projectId: string;
    slug: string;
    excludePageId?: string;
  }) {
    const filter: Record<string, unknown> = {
      tenantId: params.tenantId,
      projectId: params.projectId,
      slug: params.slug,
    };

    if (params.excludePageId) {
      filter._id = { $ne: params.excludePageId };
    }

    const existing = await this.pageModel.findOne(filter).select('_id').lean().exec();
    if (existing) {
      throw new PageSlugConflictException('Slug already exists');
    }
  }

  async createPage(params: { tenantId: string; projectId: string; title: string; slug: string; isHome?: boolean }) {
    const slug = this.normalizeSlug(params.slug);
    await this.ensureSlugAvailable({
      tenantId: params.tenantId,
      projectId: params.projectId,
      slug,
    });

    try {
      return await this.pageModel.create({
        tenantId: params.tenantId,
        projectId: params.projectId,
        title: params.title,
        slug,
        isHome: params.isHome ?? false,
        editorJson: {},
        seoJson: {},
        version: 1,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PageSlugConflictException('Slug already exists');
      }
      throw error;
    }
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

  async updatePageMeta(params: {
    tenantId: string;
    projectId: string;
    pageId: string;
    title?: string;
    slug?: string;
    seoJson?: Record<string, unknown>;
  }) {
    const page = await this.pageModel.findOne({
      _id: params.pageId,
      tenantId: params.tenantId,
      projectId: params.projectId,
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (typeof params.slug === 'string') {
      const normalizedSlug = this.normalizeSlug(params.slug);
      await this.ensureSlugAvailable({
        tenantId: params.tenantId,
        projectId: params.projectId,
        slug: normalizedSlug,
        excludePageId: params.pageId,
      });
      page.slug = normalizedSlug;
    }

    if (typeof params.title === 'string') {
      page.title = params.title.trim();
    }

    if (Object.prototype.hasOwnProperty.call(params, 'seoJson')) {
      page.seoJson = params.seoJson ?? {};
    }

    try {
      await page.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PageSlugConflictException('Slug already exists');
      }
      throw error;
    }

    return {
      id: String(page._id),
      title: page.title,
      slug: page.slug,
      isHome: page.isHome,
      updatedAt: page.updatedAt,
      version: page.version,
    };
  }

  async duplicatePage(params: {
    tenantId: string;
    projectId: string;
    pageId: string;
    title: string;
    slug: string;
  }) {
    const source = await this.pageModel.findOne({
      _id: params.pageId,
      tenantId: params.tenantId,
      projectId: params.projectId,
    });

    if (!source) {
      throw new NotFoundException('Page not found');
    }

    const slug = this.normalizeSlug(params.slug);
    await this.ensureSlugAvailable({
      tenantId: params.tenantId,
      projectId: params.projectId,
      slug,
    });

    try {
      return await this.pageModel.create({
        tenantId: params.tenantId,
        projectId: params.projectId,
        title: params.title.trim(),
        slug,
        isHome: false,
        editorJson: this.cloneJson(source.editorJson),
        seoJson: this.cloneJson(source.seoJson),
        version: 1,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PageSlugConflictException('Slug already exists');
      }
      throw error;
    }
  }

  async deletePage(params: { tenantId: string; projectId: string; pageId: string }) {
    const existing = await this.pageModel.findOne({
      _id: params.pageId,
      tenantId: params.tenantId,
      projectId: params.projectId,
    });

    if (!existing) {
      throw new NotFoundException('Page not found');
    }

    const totalPages = await this.pageModel.countDocuments({
      tenantId: params.tenantId,
      projectId: params.projectId,
    });

    if (totalPages <= 1) {
      throw new LastPageForbiddenException('Cannot delete last remaining page');
    }

    await this.pageModel.deleteOne({
      _id: params.pageId,
      tenantId: params.tenantId,
      projectId: params.projectId,
    });
  }
}
