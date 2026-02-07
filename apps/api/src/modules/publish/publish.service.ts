import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssetsService } from '../assets/assets.service';
import { MinioService } from '../assets/minio.service';
import { Navigation, NavigationDocument } from '../navigation/navigation.schema';
import { Page, PageDocument } from '../pages/page.schema';
import { PreviewRendererService } from '../pages/preview-renderer.service';
import { Publish, PublishDocument } from './publish.schema';

@Injectable()
export class PublishService {
  constructor(
    @InjectModel(Publish.name) private readonly publishModel: Model<PublishDocument>,
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(Navigation.name) private readonly navigationModel: Model<NavigationDocument>,
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

  private cssHrefForDepth(depth: number) {
    if (depth <= 0) return 'styles.css';
    return `${'../'.repeat(depth)}styles.css`;
  }

  private navHrefForDepth(href: string, depth: number) {
    if (depth <= 0) return href;
    return `${'../'.repeat(depth)}${href}`;
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

  private async resolveNavigationLinks(params: {
    tenantId: string;
    projectId: string;
    ownerUserId: string;
    pages: Array<{ _id: unknown; title?: string; slug?: string; isHome?: boolean }>;
  }) {
    const nav = await this.navigationModel
      .findOne({
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
      })
      .select('itemsJson')
      .lean()
      .exec();

    const itemsRaw = Array.isArray(nav?.itemsJson) ? nav.itemsJson : [];
    if (itemsRaw.length === 0) return [];

    const homePage = this.resolveHomePage(params.pages);
    const pageById = Object.fromEntries(params.pages.map((page) => [String(page._id), page]));

    const hrefByPageId = Object.fromEntries(
      params.pages.map((page) => {
        const pageId = String(page._id);
        const isHome = !!homePage && pageId === String(homePage._id);
        const normalizedSlug = this.normalizeSlug(this.readString(page.slug));
        const href = isHome ? 'index.html' : `${normalizedSlug || `page-${pageId}`}/index.html`;
        return [pageId, href];
      }),
    );

    return itemsRaw
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const pageId = this.readString(record.pageId).trim();
        const href = hrefByPageId[pageId];
        if (!href) return null;

        const labelRaw = this.readString(record.label).trim();
        const page = pageById[pageId];
        const label = labelRaw || this.readString(page?.title, pageId);

        return { label, href };
      })
      .filter((item): item is { label: string; href: string } => item !== null);
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

  async createAndPublish(params: { tenantId: string; projectId: string; ownerUserId: string }) {
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
      const pages = await this.pageModel
        .find({ tenantId: params.tenantId, projectId: params.projectId })
        .select('_id title slug isHome editorJson')
        .lean()
        .exec();

      if (pages.length === 0) {
        throw new NotFoundException('No pages found for project');
      }

      const homePage = this.resolveHomePage(pages);
      if (!homePage) {
        throw new NotFoundException('No pages found for project');
      }

      const assetUrlById = await this.resolveAssetUrlById({
        tenantId: params.tenantId,
        projectId: params.projectId,
        pages,
      });
      const navLinks = await this.resolveNavigationLinks({
        tenantId: params.tenantId,
        projectId: params.projectId,
        ownerUserId: params.ownerUserId,
        pages,
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
        const navLinksForPage = navLinks.map((item) => ({
          ...item,
          href: this.navHrefForDepth(item.href, depth),
        }));

        const render = this.renderer.render({
          pageId: String(page._id),
          editorJson: page.editorJson,
          assetUrlById,
          navLinks: navLinksForPage,
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
