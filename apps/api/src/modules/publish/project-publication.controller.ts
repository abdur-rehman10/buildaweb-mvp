import { Controller, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PublishService } from './publish.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectPublicationController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly publish: PublishService,
  ) {}

  @Post(':projectId/unpublish')
  async unpublishProject(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const updated = await this.publish.unpublishProject({ tenantId, ownerUserId, projectId });
    if (!updated) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    return ok({
      projectId: String(updated._id),
      isPublished: false,
      publishedSlug: updated.publishedSlug ?? null,
    });
  }
}
