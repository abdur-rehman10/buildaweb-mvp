import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssetsService } from '../assets/assets.service';
import { MinioService } from '../assets/minio.service';
import {
  Navigation,
  NavigationDocument,
} from '../navigation/navigation.schema';
import { Page, PageDocument } from '../pages/page.schema';
import { PreviewRendererService } from '../pages/preview-renderer.service';
import { Project, ProjectDocument } from '../projects/project.schema';
import { Publish, PublishDocument } from './publish.schema';
import { buildPublishDraftSnapshot } from './publish-snapshot.util';

export class PublishPreflightError extends Error {
  readonly code = 'PUBLISH_PREFLIGHT_FAILED';
  readonly details: string[];

  constructor(details: string[]) {
    super('Publish preflight validation failed');
    this.name = 'PublishPreflightError';
    this.details = details;
  }
}

@Injectable()
export class PublishService {
  private readonly publishSlugPattern = /^[A-Za-z0-9_-]+$/;
  private readonly reservedPublishSlugs = new Set([
    'index.html',
    'assets',
    '.',
    '..',
  ]);
  private readonly publishedSiteSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  private readonly reservedPublishedSiteSlugs = new Set([
    'api',
    'p',
    'published',
    'assets',
    'index',
    'index.html',
  ]);

  constructor(
    @InjectModel(Publish.name)
    private readonly publishModel: Model<PublishDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Navigation.name)
    private readonly navigationModel: Model<NavigationDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly renderer: PreviewRendererService,
    private readonly assets: AssetsService,
    private readonly minio: MinioService,
    private readonly config: ConfigService,
  ) {}

  private publishRootPath(params: {
    publishedSlug: string;
    publishedVersion: number;
  }) {
    return `published-sites/${params.publishedSlug}/v${params.publishedVersion}`;
  }

  private publishBaseUrlFromRoot(publishRootPath: string) {
    const base = (
      this.config.get<string>('MINIO_PUBLIC_BASE_URL') ??
      'http://localhost:9000'
    ).replace(/\/$/, '');
    const bucket = this.config.get<string>('MINIO_BUCKET') ?? 'buildaweb';
    return `${base}/${bucket}/${publishRootPath}/`;
  }

  private publicAppBaseUrl() {
    const publicAppUrl =
      this.config.get<string>('PUBLIC_APP_URL')?.trim() ?? '';
    return publicAppUrl.replace(/\/$/, '');
  }

  public publicSiteUrlFromSlug(publishedSlug: string) {
    const baseUrl = this.publicAppBaseUrl();
    if (!baseUrl) return '';
    return `${baseUrl}/p/${encodeURIComponent(publishedSlug)}`;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      return null;
    return value as Record<string, unknown>;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private readString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return fallback;
  }

  private toSafeSiteSlug(raw: string) {
    const basic = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    return basic || 'site';
  }

  private isValidSiteSlug(value: string) {
    return (
      this.publishedSiteSlugPattern.test(value) &&
      !this.reservedPublishedSiteSlugs.has(value)
    );
  }

  private async ensureUniquePublishedSlug(params: {
    tenantId: string;
    projectId: string;
    preferredSlug: string;
  }) {
    const preferred = this.toSafeSiteSlug(params.preferredSlug);
    let attempt = 0;

    while (attempt < 50) {
      const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
      const candidate = `${preferred}${suffix}`.slice(0, 64).replace(/-+$/, '');
      if (!this.isValidSiteSlug(candidate)) {
        attempt += 1;
        continue;
      }

      const conflict = await this.projectModel
        .findOne({
          tenantId: params.tenantId,
          publishedSlug: candidate,
          _id: { $ne: params.projectId },
        })
        .select('_id')
        .lean()
        .exec();

      if (
        !conflict ||
        String((conflict as { _id?: unknown })._id ?? '') === params.projectId
      ) {
        return candidate;
      }
      attempt += 1;
    }

    throw new Error('Unable to generate a unique publish slug');
  }

  private async resolvePublishedSlug(params: {
    tenantId: string;
    projectId: string;
    projectName: string;
    existingPublishedSlug?: unknown;
  }) {
    const current = this.readString(params.existingPublishedSlug)
      .trim()
      .toLowerCase();
    if (this.isValidSiteSlug(current)) {
      const conflict = await this.projectModel
        .findOne({
          tenantId: params.tenantId,
          publishedSlug: current,
          _id: { $ne: params.projectId },
        })
        .select('_id')
        .lean()
        .exec();
      if (
        !conflict ||
        String((conflict as { _id?: unknown })._id ?? '') === params.projectId
      )
        return current;
    }

    return this.ensureUniquePublishedSlug({
      tenantId: params.tenantId,
      projectId: params.projectId,
      preferredSlug: params.projectName,
    });
  }

  private resolvePublishedVersion(existingVersion: unknown) {
    const parsed = Number(existingVersion);
    if (!Number.isFinite(parsed) || parsed < 0) return 1;
    return Math.floor(parsed) + 1;
  }

  private collectAssetRefsFromPageJson(editorJson: unknown, refs: Set<string>) {
    const page = this.asRecord(editorJson);
    const sections = this.asArray(page?.sections);

    for (const section of sections) {
      const sectionRecord = this.asRecord(section);
      const blocks = this.asArray(sectionRecord?.blocks);

      for (const block of blocks) {
        const blockRecord = this.asRecord(block);
        const nodes = this.asArray(blockRecord?.nodes);

        for (const node of nodes) {
          const nodeRecord = this.asRecord(node);
          if (!nodeRecord) continue;

          const type = this.readString(nodeRecord.type).toLowerCase();
          if (type !== 'image') continue;

          const assetRef = this.readString(nodeRecord.asset_ref);
          if (assetRef) refs.add(assetRef);
        }
      }
    }
  }

  private normalizeSlug(slug: string) {
    return slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private isHomePageCandidate(page: { isHome?: boolean; slug?: string }) {
    const slug = this.readString(page.slug).trim();
    return page.isHome === true || slug === '/';
  }

  private validatePublishPreflight(params: {
    pages: Array<{
      _id: unknown;
      title?: string;
      slug?: string;
      isHome?: boolean;
    }>;
    navigationItems: unknown[];
  }) {
    const details: string[] = [];

    if (params.pages.length === 0) {
      return ['At least one page is required to publish.'];
    }

    let homeCount = 0;
    const pageIds = new Set<string>();
    const slugToPageIds = new Map<string, string[]>();

    for (const page of params.pages) {
      const pageId = String(page._id);
      pageIds.add(pageId);

      const pageLabel = this.readString(page.title).trim() || pageId;
      const rawSlug = this.readString(page.slug).trim();
      const normalizedSlug = this.normalizeSlug(rawSlug);
      const slugKey = (normalizedSlug || '/').toLowerCase();
      const isHome = this.isHomePageCandidate(page);

      if (isHome) {
        homeCount += 1;
      }

      if (!isHome) {
        if (!normalizedSlug) {
          details.push(`Page "${pageLabel}" has an empty slug.`);
        } else {
          if (!this.publishSlugPattern.test(normalizedSlug)) {
            details.push(
              `Page "${pageLabel}" has invalid slug "${rawSlug}". Slugs may contain only letters, numbers, hyphen, and underscore.`,
            );
          }

          if (this.reservedPublishSlugs.has(slugKey)) {
            details.push(
              `Page "${pageLabel}" uses reserved slug "${normalizedSlug}".`,
            );
          }
        }
      } else if (normalizedSlug) {
        if (!this.publishSlugPattern.test(normalizedSlug)) {
          details.push(
            `Home page "${pageLabel}" has invalid slug "${rawSlug}". Slugs may contain only letters, numbers, hyphen, and underscore.`,
          );
        }

        if (this.reservedPublishSlugs.has(slugKey)) {
          details.push(
            `Home page "${pageLabel}" uses reserved slug "${normalizedSlug}".`,
          );
        }
      }

      const existing = slugToPageIds.get(slugKey) ?? [];
      existing.push(pageId);
      slugToPageIds.set(slugKey, existing);
    }

    if (homeCount === 0) {
      details.push('Exactly one home page is required, but none was found.');
    } else if (homeCount > 1) {
      details.push(
        `Exactly one home page is required, but found ${homeCount}.`,
      );
    }

    for (const [slugKey, ids] of slugToPageIds.entries()) {
      if (ids.length > 1) {
        const duplicateSlug = slugKey === '/' ? '/' : slugKey;
        details.push(
          `Duplicate slug "${duplicateSlug}" found on ${ids.length} pages.`,
        );
      }
    }

    for (const [index, item] of params.navigationItems.entries()) {
      const record = this.asRecord(item);
      const pageId = this.readString(record?.pageId).trim();
      if (!pageId || !pageIds.has(pageId)) {
        details.push(
          `Navigation item ${index + 1} references missing pageId "${pageId || '(empty)'}".`,
        );
      }
    }

    return [...new Set(details)];
  }

  private toPageSlug(params: { slug: string; isHome?: boolean }) {
    if (params.isHome || params.slug.trim() === '/') return '/';
    const normalized = this.normalizeSlug(params.slug);
    if (!normalized) return null;
    return `/${normalized}`;
  }

  private cssHrefForDepth(depth: number) {
    if (depth <= 0) return 'styles.css';
    return `${'../'.repeat(depth)}styles.css`;
  }

  private staticHtmlDocument(params: {
    headTags: string;
    cssHref: string;
    bodyHtml: string;
    lang: string;
  }) {
    return `<!doctype html>
<html lang="${params.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${params.headTags}
    <link rel="stylesheet" href="${params.cssHref}" />
  </head>
  <body>
${params.bodyHtml}
  </body>
</html>`;
  }

  private resolveHomePage<T extends { isHome?: boolean; slug?: string }>(
    pages: T[],
  ): T | null {
    if (pages.length === 0) return null;

    const explicitHome = pages.find((page) => page.isHome === true);
    if (explicitHome) return explicitHome;

    const slashHome = pages.find((page) => (page.slug ?? '').trim() === '/');
    if (slashHome) return slashHome;

    const emptyHome = pages.find((page) => (page.slug ?? '').trim() === '');
    if (emptyHome) return emptyHome;

    return pages[0];
  }

  private resolveNavigationLinks(params: {
    pages: Array<{
      _id: unknown;
      title?: string;
      slug?: string;
      isHome?: boolean;
    }>;
    navigationItems: unknown[];
  }) {
    const itemsRaw = params.navigationItems;
    if (itemsRaw.length === 0) return [];

    const homePage = this.resolveHomePage(params.pages);
    const pageById = Object.fromEntries(
      params.pages.map((page) => [String(page._id), page]),
    );

    const targetSlugByPageId: Record<string, string> = {};
    for (const page of params.pages) {
      const pageId = String(page._id);
      const targetSlug = this.toPageSlug({
        slug: this.readString(page.slug),
        isHome: !!homePage && pageId === String(homePage._id),
      });
      if (!targetSlug) continue;
      targetSlugByPageId[pageId] = targetSlug;
    }

    return itemsRaw
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const pageId = this.readString(record.pageId).trim();
        const targetSlug = targetSlugByPageId[pageId];
        if (!targetSlug) return null;

        const labelRaw = this.readString(record.label).trim();
        const page = pageById[pageId];
        const label = labelRaw || this.readString(page?.title, pageId);

        return { label, targetSlug };
      })
      .filter(
        (item): item is { label: string; targetSlug: string } => item !== null,
      );
  }

  private async resolveAssetUrlById(params: {
    tenantId: string;
    projectId: string;
    pages: Array<{ editorJson: unknown }>;
    settingsAssetIds?: string[];
  }) {
    const refs = new Set<string>();
    for (const page of params.pages) {
      this.collectAssetRefsFromPageJson(page.editorJson, refs);
    }
    for (const settingsAssetId of params.settingsAssetIds ?? []) {
      const normalized = this.readString(settingsAssetId).trim();
      if (normalized) {
        refs.add(normalized);
      }
    }

    const validAssetIds = [...refs].filter((id) => Types.ObjectId.isValid(id));
    const assets = await this.assets.getByIdsScoped({
      tenantId: params.tenantId,
      projectId: params.projectId,
      assetIds: validAssetIds,
    });

    return Object.fromEntries(
      assets.map((asset) => [String(asset._id), asset.publicUrl]),
    );
  }

  async getByIdScoped(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
    publishId: string;
  }) {
    return this.publishModel
      .findOne({
        _id: params.publishId,
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
      })
      .exec();
  }

  async listByProjectScoped(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
    limit: number;
  }) {
    return this.publishModel
      .find({
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
      })
      .sort({ createdAt: -1 })
      .limit(params.limit)
      .exec();
  }

  async getProjectByPublishedSlug(params: {
    slug: string;
    onlyPublished: boolean;
  }) {
    const normalizedSlug = this.readString(params.slug).trim().toLowerCase();
    if (!this.isValidSiteSlug(normalizedSlug)) return null;

    const filter: Record<string, unknown> = {
      publishedSlug: normalizedSlug,
    };
    if (params.onlyPublished) {
      filter.isPublished = true;
    }

    return this.projectModel
      .findOne(filter)
      .select(
        '_id tenantId ownerUserId name isPublished publishedAt publishedSlug publishedBucketKey publishedVersion latestPublishId updatedAt',
      )
      .lean()
      .exec();
  }

  private isObjectNotFoundError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const code = this.readString(
      (error as Record<string, unknown>).code,
    ).toLowerCase();
    return (
      code === 'notfound' || code === 'nosuchkey' || code === 'nosuchobject'
    );
  }

  private resolvePublishedObjectPath(requestPath?: string) {
    const cleaned = this.readString(requestPath).trim().replace(/^\/+/, '');
    if (!cleaned) {
      return { relativePath: 'index.html', isAsset: false };
    }

    const pathOnly = cleaned.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const isFileLike = /\.[A-Za-z0-9]+$/.test(pathOnly);
    if (isFileLike) {
      const isHtml = pathOnly.toLowerCase().endsWith('.html');
      return { relativePath: pathOnly, isAsset: !isHtml };
    }

    return { relativePath: 'index.html', isAsset: false };
  }

  async loadPublishedObjectBySlug(params: {
    slug: string;
    requestPath?: string;
  }) {
    const project = await this.getProjectByPublishedSlug({
      slug: params.slug,
      onlyPublished: true,
    });
    if (!project) return null;

    const bucketKey = this.readString(project.publishedBucketKey).trim();
    if (!bucketKey) return null;

    const resolved = this.resolvePublishedObjectPath(params.requestPath);
    const objectPath = `${bucketKey}/${resolved.relativePath}`;

    try {
      const stat = await this.minio.statObject({ objectPath });
      const stream = await this.minio.getObjectStream({ objectPath });
      const metadata =
        (stat as { metaData?: Record<string, string> }).metaData ?? {};
      const contentType =
        this.readString(metadata['content-type']).trim() ||
        'application/octet-stream';
      const cacheControl = resolved.isAsset
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=60, must-revalidate';
      return {
        stream,
        contentType,
        cacheControl,
      };
    } catch (error) {
      if (this.isObjectNotFoundError(error)) return null;
      throw error;
    }
  }

  async unpublishProject(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
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
            isPublished: false,
            status: 'draft',
          },
        },
        { new: true },
      )
      .exec();
  }

  async createAndPublish(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
  }) {
    const project = await this.projectModel
      .findOne({
        _id: params.projectId,
        tenantId: params.tenantId,
        ownerUserId: params.ownerUserId,
      })
      .select(
        '_id name defaultLocale locale siteName faviconAssetId defaultOgImageAssetId publishedSlug publishedVersion',
      )
      .lean()
      .exec();
    if (!project) {
      throw new Error('Project not found');
    }

    const pages = await this.pageModel
      .find({ tenantId: params.tenantId, projectId: params.projectId })
      .select('_id title slug isHome editorJson seoJson')
      .lean()
      .exec();

    const nav = await this.navigationModel
      .findOne({
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .select('itemsJson')
      .lean()
      .exec();

    const navigationItems = Array.isArray(nav?.itemsJson) ? nav.itemsJson : [];
    const preflightErrors = this.validatePublishPreflight({
      pages,
      navigationItems,
    });
    if (preflightErrors.length > 0) {
      throw new PublishPreflightError(preflightErrors);
    }

    const homePage = this.resolveHomePage(pages);
    if (!homePage) {
      throw new PublishPreflightError([
        'Exactly one home page is required, but none was found.',
      ]);
    }

    const publishedSlug = await this.resolvePublishedSlug({
      tenantId: params.tenantId,
      projectId: params.projectId,
      projectName: this.readString(project.name),
      existingPublishedSlug: project.publishedSlug,
    });
    const publishedVersion = this.resolvePublishedVersion(
      project.publishedVersion,
    );
    const publishedBucketKey = this.publishRootPath({
      publishedSlug,
      publishedVersion,
    });
    const baseUrl = this.publishBaseUrlFromRoot(publishedBucketKey);

    const draftSnapshot = buildPublishDraftSnapshot({
      project,
      pages,
      navigationItems,
    });

    const publish = await this.publishModel.create({
      tenantId: params.tenantId,
      projectId: params.projectId,
      ownerUserId: params.ownerUserId,
      status: 'publishing',
      baseUrl,
      errorMessage: null,
      draftSnapshot,
    });

    try {
      const faviconAssetId = this.readString(project.faviconAssetId).trim();
      const defaultOgImageAssetId = this.readString(
        project.defaultOgImageAssetId,
      ).trim();
      const assetUrlById = await this.resolveAssetUrlById({
        tenantId: params.tenantId,
        projectId: params.projectId,
        pages,
        settingsAssetIds: [faviconAssetId, defaultOgImageAssetId],
      });
      const navLinks = this.resolveNavigationLinks({
        pages,
        navigationItems,
      });
      const faviconUrl = faviconAssetId
        ? this.readString(assetUrlById[faviconAssetId]).trim()
        : '';
      const defaultOgImageUrl = defaultOgImageAssetId
        ? this.readString(assetUrlById[defaultOgImageAssetId]).trim()
        : '';
      const locale =
        this.readString(project.locale).trim() ||
        this.readString(project.defaultLocale).trim() ||
        'en';
      const siteName = this.readString(project.siteName).trim();

      let sharedCss = '';
      const publishRoot = publishedBucketKey;

      for (const page of pages) {
        const isHome = String(page._id) === String(homePage._id);
        const normalizedSlug = this.normalizeSlug(this.readString(page.slug));
        const relativePath = isHome
          ? 'index.html'
          : `${normalizedSlug || `page-${String(page._id)}`}/index.html`;
        const depth = isHome ? 0 : relativePath.split('/').length - 1;
        const currentSlug =
          this.toPageSlug({
            slug: this.readString(page.slug),
            isHome,
          }) ?? `/${normalizedSlug || `page-${String(page._id)}`}`;

        const render = this.renderer.render({
          pageId: String(page._id),
          editorJson: page.editorJson,
          assetUrlById,
          navLinks,
          currentSlug,
          linkMode: 'publish',
          pageTitle:
            this.readString(page.title, 'Buildaweb Site') || 'Buildaweb Site',
          seoJson: page.seoJson,
          siteName,
          faviconUrl,
          defaultOgImageUrl,
          locale,
        });

        if (!sharedCss) {
          sharedCss = render.css;
        }

        const html = this.staticHtmlDocument({
          headTags: render.headTags,
          cssHref: this.cssHrefForDepth(depth),
          bodyHtml: render.html,
          lang: render.lang,
        });

        await this.minio.upload({
          objectPath: `${publishRoot}/${relativePath}`,
          buffer: Buffer.from(html, 'utf-8'),
          mimeType: 'text/html; charset=utf-8',
          sizeBytes: Buffer.byteLength(html),
        });
      }

      if (!sharedCss) {
        sharedCss = this.renderer.render({
          pageId: String(homePage._id),
          editorJson: homePage.editorJson,
          navLinks,
          currentSlug: '/',
          locale,
        }).css;
      }

      await this.minio.upload({
        objectPath: `${publishRoot}/styles.css`,
        buffer: Buffer.from(sharedCss, 'utf-8'),
        mimeType: 'text/css; charset=utf-8',
        sizeBytes: Buffer.byteLength(sharedCss),
      });

      publish.status = 'live';
      publish.errorMessage = null;
      await publish.save();

      await this.projectModel
        .updateOne(
          {
            _id: params.projectId,
            tenantId: params.tenantId,
            ownerUserId: params.ownerUserId,
          },
          {
            $set: {
              latestPublishId: String(publish._id),
              isPublished: true,
              publishedSlug,
              publishedBucketKey,
              publishedVersion,
              publishedAt: new Date(),
              status: 'published',
            },
          },
        )
        .exec();

      const publicUrl = this.publicSiteUrlFromSlug(publishedSlug);

      return {
        publishId: String(publish._id),
        status: publish.status,
        slug: publishedSlug,
        url: publicUrl,
        publishedUrl: publicUrl,
        publishedSlug,
        publishedVersion,
      };
    } catch (error) {
      publish.status = 'failed';
      publish.errorMessage =
        error instanceof Error ? error.message : 'Publish failed';
      await publish.save();
      throw error;
    }
  }
}
