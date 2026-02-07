import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { fail, ok } from '../../common/api-response';
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
    private readonly previewRenderer: PreviewRendererService,
  ) {}

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

    const preview = this.previewRenderer.render({
      pageId: String(page._id),
      editorJson: page.editorJson,
    });

    return ok(preview);
  }
}
