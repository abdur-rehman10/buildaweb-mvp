import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { fail, ok } from '../../common/api-response';
import { AssetsService } from '../assets/assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

    const preview = this.previewRenderer.render({
      pageId: String(page._id),
      editorJson: page.editorJson,
      assetUrlById,
    });

    return ok(preview);
  }
}
