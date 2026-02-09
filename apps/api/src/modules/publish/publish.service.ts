import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssetsService } from '../assets/assets.service';
import { MinioService } from '../assets/minio.service';
import { Navigation, NavigationDocument } from '../navigation/navigation.schema';
import { Page, PageDocument } from '../pages/page.schema';
import { PreviewRendererService } from '../pages/preview-renderer.service';
import { Project, ProjectDocument } from '../projects/project.schema';
import { Publish, PublishDocument } from './publish.schema';

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
  private readonly reservedPublishSlugs = new Set(['index.html', 'assets', '.', '..']);

  constructor(
    @InjectModel(Publish.name) private readonly publishModel: Model<PublishDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Navigation.name) private readonly navigationModel: Model<NavigationDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    private readonly renderer: PreviewRendererService,
    private readonly assets: AssetsService,
    private readonly minio: MinioService,
    private readonly config: ConfigService,
  ) {}

  private publishRootPath(params: { tenantId: string; projectId: string; publishId: string }) {
    return `buildaweb-sites/tenants/${params.tenantId}/projects/${params.projectId}/publishes/${params.publishId}`;
  }

  private publishBaseUrl(params: { tenantId: string; projectId: string; publishId: string }) {
    const base = (this.config.get<string>('MINIO_PUBLIC_BASE_URL') ?? 'http://localhost:9000').replace(/\/$/, '');
    const bucket = this.config.get<string>('MINIO_BUCKET') ?? 'buildaweb';
    return `${base}/${bucket}/${this.publishRootPath(params)}/`;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
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
    pages: Array<{ _id: unknown; title?: string; slug?: string; isHome?: boolean }>;
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
            details.push(`Page "${pageLabel}" uses reserved slug "${normalizedSlug}".`);
          }
        }
      } else if (normalizedSlug) {
        if (!this.publishSlugPattern.test(normalizedSlug)) {
          details.push(
            `Home page "${pageLabel}" has invalid slug "${rawSlug}". Slugs may contain only letters, numbers, hyphen, and underscore.`,
          );
        }

        if (this.reservedPublishSlugs.has(slugKey)) {
          details.push(`Home page "${pageLabel}" uses reserved slug "${normalizedSlug}".`);
        }
      }

      const existing = slugToPageIds.get(slugKey) ?? [];
      existing.push(pageId);
      slugToPageIds.set(slugKey, existing);
    }

    if (homeCount === 0) {
      details.push('Exactly one home page is required, but none was found.');
    } else if (homeCount > 1) {
      details.push(`Exactly one home page is required, but found ${homeCount}.`);
    }

    for (const [slugKey, ids] of slugToPageIds.entries()) {
      if (ids.length > 1) {
        const duplicateSlug = slugKey === '/' ? '/' : slugKey;
        details.push(`Duplicate slug "${duplicateSlug}" found on ${ids.length} pages.`);
      }
    }

    for (const [index, item] of params.navigationItems.entries()) {
      const record = this.asRecord(item);
      const pageId = this.readString(record?.pageId).trim();
      if (!pageId || !pageIds.has(pageId)) {
        details.push(`Navigation item ${index + 1} references missing pageId "${pageId || '(empty)'}".`);
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

  private staticHtmlDocument(params: { title: string; cssHref: string; bodyHtml: string }) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${params.title}</title>
    <link rel="stylesheet" href="${params.cssHref}" />
  </head>
  <body>
${params.bodyHtml}
  </body>
</html>`;
  }

  private resolveHomePage<T extends { isHome?: boolean; slug?: string }>(pages: T[]): T | null {
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
    pages: Array<{ _id: unknown; title?: string; slug?: string; isHome?: boolean }>;
    navigationItems: unknown[];
  }) {
    const itemsRaw = params.navigationItems;
    if (itemsRaw.length === 0) return [];

    const homePage = this.resolveHomePage(params.pages);
    const pageById = Object.fromEntries(params.pages.map((page) => [String(page._id), page]));

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
      .filter((item): item is { label: string; targetSlug: string } => item !== null);
  }

  private async resolveAssetUrlById(params: { tenantId: string; projectId: string; pages: Array<{ editorJson: unknown }> }) {
    const refs = new Set<string>();
    for (const page of params.pages) {
      this.collectAssetRefsFromPageJson(page.editorJson, refs);
    }

    const validAssetIds = [...refs].filter((id) => Types.ObjectId.isValid(id));
    const assets = await this.assets.getByIdsScoped({
      tenantId: params.tenantId,
      projectId: params.projectId,
      assetIds: validAssetIds,
    });

    return Object.fromEntries(assets.map((asset) => [String(asset._id), asset.publicUrl]));
  }

  async getByIdScoped(params: { tenantId: string; projectId: string; ownerUserId: string; publishId: string }) {
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

  async createAndPublish(params: { tenantId: string; projectId: string; ownerUserId: string }) {
    const pages = await this.pageModel
      .find({ tenantId: params.tenantId, projectId: params.projectId })
      .select('_id title slug isHome editorJson')
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
      throw new PublishPreflightError(['Exactly one home page is required, but none was found.']);
    }

    const baseUrl = this.publishBaseUrl({
      tenantId: params.tenantId,
      projectId: params.projectId,
      publishId: new Types.ObjectId().toString(),
    });

    const publish = await this.publishModel.create({
      tenantId: params.tenantId,
      projectId: params.projectId,
      ownerUserId: params.ownerUserId,
      status: 'publishing',
      baseUrl,
      errorMessage: null,
    });

    publish.baseUrl = this.publishBaseUrl({
      tenantId: params.tenantId,
      projectId: params.projectId,
      publishId: String(publish._id),
    });
    await publish.save();

    try {
      const assetUrlById = await this.resolveAssetUrlById({
        tenantId: params.tenantId,
        projectId: params.projectId,
        pages,
      });
      const navLinks = this.resolveNavigationLinks({
        pages,
        navigationItems,
      });

      let sharedCss = '';
      const publishRoot = this.publishRootPath({
        tenantId: params.tenantId,
        projectId: params.projectId,
        publishId: String(publish._id),
      });

      for (const page of pages) {
        const isHome = String(page._id) === String(homePage._id);
        const normalizedSlug = this.normalizeSlug(this.readString(page.slug));
        const relativePath = isHome ? 'index.html' : `${normalizedSlug || `page-${String(page._id)}`}/index.html`;
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
        });

        if (!sharedCss) {
          sharedCss = render.css;
        }

        const html = this.staticHtmlDocument({
          title: this.readString(page.title, 'Buildaweb Site') || 'Buildaweb Site',
          cssHref: this.cssHrefForDepth(depth),
          bodyHtml: render.html,
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
              publishedAt: new Date(),
            },
          },
        )
        .exec();

      return {
        publishId: String(publish._id),
        status: publish.status,
        url: publish.baseUrl,
      };
    } catch (error) {
      publish.status = 'failed';
      publish.errorMessage = error instanceof Error ? error.message : 'Publish failed';
      await publish.save();
      throw error;
    }
  }
}
