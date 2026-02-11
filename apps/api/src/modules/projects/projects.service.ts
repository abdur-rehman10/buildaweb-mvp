import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiGeneratedSite } from '../ai/ai.service';
import {
  Navigation,
  NavigationDocument,
} from '../navigation/navigation.schema';
import { Page, PageDocument } from '../pages/page.schema';
import { Publish, PublishDocument } from '../publish/publish.schema';
import {
  buildPublishDraftSnapshot,
  snapshotSignature,
  type PublishDraftSnapshot,
} from '../publish/publish-snapshot.util';
import { Project, ProjectDocument } from './project.schema';

type ProjectWithDraftStatus = {
  project: {
    _id: unknown;
    name: string;
    status: 'draft' | 'published' | 'archived';
    defaultLocale: string;
    homePageId?: unknown;
    latestPublishId?: string | null;
    publishedAt?: Date | null;
    siteName?: string | null;
    logoAssetId?: string | null;
    faviconAssetId?: string | null;
    defaultOgImageAssetId?: string | null;
    locale?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
  hasUnpublishedChanges: boolean;
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Navigation.name)
    private readonly navigationModel: Model<NavigationDocument>,
    @InjectModel(Publish.name)
    private readonly publishModel: Model<PublishDocument>,
  ) {}

  private normalizeOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeLocale(value: unknown, fallback = 'en'): string {
    const normalized = this.normalizeOptionalString(value);
    return normalized ?? fallback;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }

  private normalizeGeneratedSlug(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === '/' || trimmed === 'home') return '/';
    const withoutEdges = trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
    return withoutEdges || '/';
  }

  private isValidGeneratedSlug(slug: string) {
    if (slug === '/') return true;
    return /^[a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*)*$/.test(slug);
  }

  private isDuplicateKeyError(error: unknown) {
    return !!(
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private mapSettings(project: ProjectDocument) {
    return {
      siteName: this.normalizeOptionalString(project.siteName),
      logoAssetId: this.normalizeOptionalString(project.logoAssetId),
      faviconAssetId: this.normalizeOptionalString(project.faviconAssetId),
      defaultOgImageAssetId: this.normalizeOptionalString(
        project.defaultOgImageAssetId,
      ),
      locale: this.normalizeLocale(
        project.locale,
        this.normalizeLocale(project.defaultLocale, 'en'),
      ),
    };
  }

  async create(params: {
    tenantId: string;
    ownerUserId: string;
    name: string;
    defaultLocale: string;
  }) {
    const existingProject = await this.findFirstByOwner({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
    });
    if (existingProject) {
      throw new ForbiddenException('User already has a project');
    }

    try {
      return await this.projectModel.create({
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
        name: params.name,
        defaultLocale: params.defaultLocale,
        status: 'draft',
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ForbiddenException('User already has a project');
      }
      throw error;
    }
  }

  async findFirstByOwner(params: { tenantId: string; ownerUserId: string }) {
    return this.projectModel
      .findOne({ tenantId: params.tenantId, ownerUserId: params.ownerUserId })
      .exec();
  }

  async listByOwner(params: { tenantId: string; ownerUserId: string }) {
    return this.projectModel
      .find({ tenantId: params.tenantId, ownerUserId: params.ownerUserId })
      .exec();
  }

  private normalizeLatestPublishId(value: unknown): string | null {
    const normalized = this.normalizeOptionalString(value);
    if (!normalized) return null;
    return Types.ObjectId.isValid(normalized) ? normalized : null;
  }

  private buildCurrentDraftSnapshot(params: {
    project: {
      defaultLocale?: unknown;
      locale?: unknown;
      siteName?: unknown;
      faviconAssetId?: unknown;
      defaultOgImageAssetId?: unknown;
    };
    pages: Array<{
      _id?: unknown;
      title?: unknown;
      slug?: unknown;
      isHome?: boolean;
      editorJson?: unknown;
      seoJson?: unknown;
    }>;
    navigationItems: unknown[];
  }): PublishDraftSnapshot {
    return buildPublishDraftSnapshot({
      project: params.project,
      pages: params.pages,
      navigationItems: params.navigationItems,
    });
  }

  private async computeDraftStatus(params: {
    tenantId: string;
    ownerUserId: string;
    projects: Array<{
      _id: unknown;
      latestPublishId?: string | null;
      defaultLocale?: unknown;
      locale?: unknown;
      siteName?: unknown;
      faviconAssetId?: unknown;
      defaultOgImageAssetId?: unknown;
    }>;
  }) {
    const projectIds = params.projects.map((project) => String(project._id));
    if (projectIds.length === 0) {
      return new Map<string, boolean>();
    }

    const [pages, navigations] = await Promise.all([
      this.pageModel
        .find({
          tenantId: params.tenantId,
          projectId: { $in: projectIds },
        })
        .select('_id projectId title slug isHome editorJson seoJson')
        .lean()
        .exec(),
      this.navigationModel
        .find({
          tenantId: params.tenantId,
          projectId: { $in: projectIds },
        })
        .select('projectId itemsJson')
        .lean()
        .exec(),
    ]);

    const pagesByProjectId = new Map<string, typeof pages>();
    for (const page of pages) {
      const projectId = String(page.projectId);
      const existing = pagesByProjectId.get(projectId);
      if (existing) {
        existing.push(page);
      } else {
        pagesByProjectId.set(projectId, [page]);
      }
    }

    const navigationItemsByProjectId = new Map<string, unknown[]>();
    for (const navigation of navigations) {
      navigationItemsByProjectId.set(
        String(navigation.projectId),
        Array.isArray(navigation.itemsJson) ? navigation.itemsJson : [],
      );
    }

    const currentSnapshotByProjectId = new Map<string, PublishDraftSnapshot>();
    for (const project of params.projects) {
      const projectId = String(project._id);
      currentSnapshotByProjectId.set(
        projectId,
        this.buildCurrentDraftSnapshot({
          project,
          pages: pagesByProjectId.get(projectId) ?? [],
          navigationItems: navigationItemsByProjectId.get(projectId) ?? [],
        }),
      );
    }

    const latestPublishIds = params.projects
      .map((project) => this.normalizeLatestPublishId(project.latestPublishId))
      .filter((value): value is string => value !== null);

    const publishSnapshotById = new Map<string, PublishDraftSnapshot>();
    if (latestPublishIds.length > 0) {
      const publishes = await this.publishModel
        .find({
          _id: { $in: latestPublishIds },
          tenantId: params.tenantId,
          ownerUserId: params.ownerUserId,
          projectId: { $in: projectIds },
          status: 'live',
        })
        .select('_id draftSnapshot')
        .lean()
        .exec();

      for (const publish of publishes) {
        if (publish.draftSnapshot) {
          publishSnapshotById.set(
            String(publish._id),
            publish.draftSnapshot as PublishDraftSnapshot,
          );
        }
      }
    }

    const hasUnpublishedChangesByProjectId = new Map<string, boolean>();
    for (const project of params.projects) {
      const projectId = String(project._id);
      const latestPublishId = this.normalizeLatestPublishId(
        project.latestPublishId,
      );

      if (!latestPublishId) {
        hasUnpublishedChangesByProjectId.set(projectId, true);
        continue;
      }

      const liveSnapshot = publishSnapshotById.get(latestPublishId);
      if (!liveSnapshot) {
        hasUnpublishedChangesByProjectId.set(projectId, true);
        continue;
      }

      const currentSnapshot = currentSnapshotByProjectId.get(projectId);
      hasUnpublishedChangesByProjectId.set(
        projectId,
        snapshotSignature(currentSnapshot) !== snapshotSignature(liveSnapshot),
      );
    }

    return hasUnpublishedChangesByProjectId;
  }

  async listByOwnerWithDraftStatus(params: {
    tenantId: string;
    ownerUserId: string;
  }): Promise<ProjectWithDraftStatus[]> {
    const projects = await this.projectModel
      .find({ tenantId: params.tenantId, ownerUserId: params.ownerUserId })
      .lean()
      .exec();

    const hasUnpublishedChangesByProjectId = await this.computeDraftStatus({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      projects,
    });

    return projects.map((project) => ({
      project,
      hasUnpublishedChanges:
        hasUnpublishedChangesByProjectId.get(String(project._id)) ?? true,
    }));
  }

  async getByIdScoped(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
  }) {
    return this.projectModel
      .findOne({
        _id: params.projectId,
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
      })
      .exec();
  }

  async getByIdScopedWithDraftStatus(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
  }): Promise<ProjectWithDraftStatus | null> {
    const project = await this.projectModel
      .findOne({
        _id: params.projectId,
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
      })
      .lean()
      .exec();
    if (!project) return null;

    const hasUnpublishedChangesByProjectId = await this.computeDraftStatus({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      projects: [project],
    });

    return {
      project,
      hasUnpublishedChanges:
        hasUnpublishedChangesByProjectId.get(String(project._id)) ?? true,
    };
  }

  async getSettings(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
  }) {
    const project = await this.getByIdScoped(params);
    if (!project) {
      return null;
    }

    return this.mapSettings(project);
  }

  async updateSettings(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    siteName?: string | null;
    logoAssetId?: string | null;
    faviconAssetId?: string | null;
    defaultOgImageAssetId?: string | null;
    locale?: string | null;
  }) {
    const project = await this.getByIdScoped(params);
    if (!project) {
      return null;
    }

    const originalHomePageId = project.homePageId
      ? String(project.homePageId)
      : null;
    const setPayload: {
      siteName?: string | null;
      logoAssetId?: string | null;
      faviconAssetId?: string | null;
      defaultOgImageAssetId?: string | null;
      locale?: string;
    } = {};

    if (Object.prototype.hasOwnProperty.call(params, 'siteName')) {
      setPayload.siteName = this.normalizeOptionalString(params.siteName);
    }
    if (Object.prototype.hasOwnProperty.call(params, 'logoAssetId')) {
      setPayload.logoAssetId = this.normalizeOptionalString(params.logoAssetId);
    }
    if (Object.prototype.hasOwnProperty.call(params, 'faviconAssetId')) {
      setPayload.faviconAssetId = this.normalizeOptionalString(
        params.faviconAssetId,
      );
    }
    if (Object.prototype.hasOwnProperty.call(params, 'defaultOgImageAssetId')) {
      setPayload.defaultOgImageAssetId = this.normalizeOptionalString(
        params.defaultOgImageAssetId,
      );
    }
    if (Object.prototype.hasOwnProperty.call(params, 'locale')) {
      setPayload.locale = this.normalizeLocale(
        params.locale,
        this.normalizeLocale(project.defaultLocale, 'en'),
      );
    } else if (!this.normalizeOptionalString(project.locale)) {
      setPayload.locale = this.normalizeLocale(project.defaultLocale, 'en');
    }

    if (Object.keys(setPayload).length > 0) {
      await this.projectModel
        .updateOne(
          {
            _id: params.projectId,
            tenantId: params.tenantId,
            ownerUserId: params.ownerUserId,
          },
          { $set: setPayload },
        )
        .exec();
    }

    const refreshedProject = await this.getByIdScoped(params);
    if (!refreshedProject) {
      return null;
    }

    const refreshedHomePageId = refreshedProject.homePageId
      ? String(refreshedProject.homePageId)
      : null;
    if (refreshedHomePageId !== originalHomePageId) {
      throw new InternalServerErrorException(
        'Project home page changed unexpectedly while updating settings',
      );
    }

    return this.mapSettings(refreshedProject);
  }

  async replaceProjectContentFromGeneration(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    generated: AiGeneratedSite;
  }) {
    const project = await this.getByIdScoped({
      tenantId: params.tenantId,
      ownerUserId: params.ownerUserId,
      projectId: params.projectId,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const generatedPages = Array.isArray(params.generated.pages)
      ? params.generated.pages
      : [];
    if (generatedPages.length === 0) {
      throw new InternalServerErrorException(
        'Generated site did not include any pages',
      );
    }

    let explicitHomeIndex = generatedPages.findIndex(
      (page) =>
        page.isHome === true || this.normalizeGeneratedSlug(page.slug) === '/',
    );
    if (explicitHomeIndex < 0) explicitHomeIndex = 0;

    const seenSlugs = new Set<string>();
    const pageDocs: Array<Record<string, unknown>> = [];
    const pageIdBySlug = new Map<string, string>();
    const pageTitleBySlug = new Map<string, string>();

    for (let index = 0; index < generatedPages.length; index += 1) {
      const source = generatedPages[index];
      const normalizedTitle =
        this.normalizeOptionalString(source.title) ?? `Page ${index + 1}`;
      const normalizedSlug =
        index === explicitHomeIndex
          ? '/'
          : this.normalizeGeneratedSlug(source.slug);

      if (!this.isValidGeneratedSlug(normalizedSlug)) {
        throw new InternalServerErrorException(
          `Generated page "${normalizedTitle}" has invalid slug "${source.slug}"`,
        );
      }

      if (seenSlugs.has(normalizedSlug)) {
        throw new InternalServerErrorException(
          `Generated site contains duplicate slug "${normalizedSlug}"`,
        );
      }
      seenSlugs.add(normalizedSlug);

      const pageId = new Types.ObjectId();
      const editorJson = this.asRecord(source.editorJson) ?? {};
      const seoJson = this.asRecord(source.seoJson) ?? {};

      const storedSlug = normalizedSlug === '/' ? '/' : normalizedSlug;
      pageIdBySlug.set(normalizedSlug, String(pageId));
      pageTitleBySlug.set(normalizedSlug, normalizedTitle);

      pageDocs.push({
        _id: pageId,
        tenantId: params.tenantId,
        projectId: new Types.ObjectId(params.projectId),
        title: normalizedTitle,
        slug: storedSlug,
        isHome: index === explicitHomeIndex,
        editorJson,
        seoJson,
        version: 1,
      });
    }

    const generatedNavigation = Array.isArray(params.generated.navigation)
      ? params.generated.navigation
      : [];
    const navigationItems: Array<{ label: string; pageId: string }> = [];

    for (const navItem of generatedNavigation) {
      const navSlug = this.normalizeGeneratedSlug(navItem.slug);
      const pageId = pageIdBySlug.get(navSlug);
      if (!pageId) {
        throw new InternalServerErrorException(
          `Generated navigation references missing slug "${navItem.slug}"`,
        );
      }

      const navLabel = this.normalizeOptionalString(navItem.label);
      navigationItems.push({
        label: navLabel ?? pageTitleBySlug.get(navSlug) ?? navSlug,
        pageId,
      });
    }

    if (navigationItems.length === 0) {
      for (const [slug, pageId] of pageIdBySlug.entries()) {
        navigationItems.push({
          label: pageTitleBySlug.get(slug) ?? slug,
          pageId,
        });
      }
      navigationItems.sort(
        (a, b) =>
          Number(b.pageId === pageIdBySlug.get('/')) -
          Number(a.pageId === pageIdBySlug.get('/')),
      );
    }

    await this.pageModel.deleteMany({
      tenantId: params.tenantId,
      projectId: params.projectId,
    });
    await this.pageModel.insertMany(pageDocs);

    await this.navigationModel
      .findOneAndUpdate(
        {
          tenantId: params.tenantId,
          projectId: params.projectId,
          ownerUserId: params.ownerUserId,
        },
        {
          $set: {
            itemsJson: navigationItems,
          },
        },
        { upsert: true, new: true },
      )
      .exec();

    const homePageId = pageIdBySlug.get('/');
    if (!homePageId) {
      throw new InternalServerErrorException(
        'Generated site did not resolve a home page',
      );
    }

    await this.projectModel
      .updateOne(
        {
          _id: params.projectId,
          tenantId: params.tenantId,
          ownerUserId: params.ownerUserId,
        },
        {
          $set: {
            homePageId: homePageId,
          },
        },
      )
      .exec();

    return {
      homePageId,
      pageCount: pageDocs.length,
    };
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

  async setHomePage(params: {
    tenantId: string;
    ownerUserId: string;
    projectId: string;
    pageId: string;
  }) {
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
      const currentItems = Array.isArray(navigation.itemsJson)
        ? navigation.itemsJson
        : [];
      const existingTarget = currentItems.find(
        (item) => item.pageId === params.pageId,
      );
      const remainingItems = currentItems.filter(
        (item) => item.pageId !== params.pageId,
      );

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
