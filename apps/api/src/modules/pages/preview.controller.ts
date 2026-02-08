import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { fail, ok } from '../../common/api-response';
import { AssetsService } from '../assets/assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Navigation, NavigationDocument } from '../navigation/navigation.schema';
import { ProjectsService } from '../projects/projects.service';
import { PagesService } from './pages.service';
import { PreviewRendererService } from './preview-renderer.service';

@Controller('projects/:projectId/preview')
@UseGuards(JwtAuthGuard)
export class PreviewController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly pages: PagesService,
    private readonly assets: AssetsService,
    private readonly previewRenderer: PreviewRendererService,
    @InjectModel(Navigation.name) private readonly navigationModel: Model<NavigationDocument>,
  ) {}

  private asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private readString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return '';
  }

  private normalizeSlug(slug: string) {
    return slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private toPageSlug(params: { slug: string; isHome?: boolean }) {
    if (params.isHome || params.slug.trim() === '/') return '/';
    const normalized = this.normalizeSlug(params.slug);
    if (!normalized) return null;
    return `/${normalized}`;
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

  private async loadNavigationLinks(params: { tenantId: string; projectId: string }) {
    const nav = await this.navigationModel
      .findOne({
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .select('itemsJson')
      .lean()
      .exec();

    const itemsRaw = Array.isArray(nav?.itemsJson) ? nav.itemsJson : [];
    if (itemsRaw.length === 0) return [];

    const pages = await this.pages.listPages({
      tenantId: params.tenantId,
      projectId: params.projectId,
    });
    if (pages.length === 0) return [];

    const homePage = this.resolveHomePage(pages);
    const pageSlugById: Record<string, string> = {};
    for (const page of pages) {
      const targetSlug = this.toPageSlug({
        slug: this.readString(page.slug),
        isHome: !!homePage && page.id === homePage.id,
      });
      if (!targetSlug) continue;
      pageSlugById[page.id] = targetSlug;
    }

    return itemsRaw
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const pageId = this.readString(record.pageId).trim();
        const targetSlug = pageSlugById[pageId];
        if (!targetSlug) return null;

        const labelRaw = this.readString(record.label).trim();
        const page = pages.find((entry) => entry.id === pageId);
        const label = labelRaw || page?.title || page?.id || targetSlug;

        return { label, targetSlug };
      })
      .filter((item): item is { label: string; targetSlug: string } => item !== null);
  }

  private collectAssetRefs(editorJson: unknown): string[] {
    const page = this.asRecord(editorJson);
    const sections = this.asArray(page?.sections);
    const refs = new Set<string>();

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
          if (assetRef) {
            refs.add(assetRef);
          }
        }
      }
    }

    return [...refs];
  }

  @Get(':pageId')
  async previewPage(@Param('projectId') projectId: string, @Param('pageId') pageId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const page = await this.pages.getPage({ tenantId, projectId, pageId });
    if (!page) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const assetRefs = this.collectAssetRefs(page.editorJson);
    const validAssetIds = assetRefs.filter((assetId) => Types.ObjectId.isValid(assetId));
    const assets = await this.assets.getByIdsScoped({
      tenantId,
      projectId,
      assetIds: validAssetIds,
    });
    const assetUrlById = Object.fromEntries(assets.map((asset) => [String(asset._id), asset.publicUrl]));
    const navLinks = await this.loadNavigationLinks({ tenantId, projectId });
    const currentSlug = this.toPageSlug({
      slug: this.readString(page.slug),
      isHome: page.isHome,
    }) ?? '/';

    const preview = this.previewRenderer.render({
      pageId: String(page._id),
      editorJson: page.editorJson,
      assetUrlById,
      navLinks,
      currentSlug,
    });

    return ok(preview);
  }
}
