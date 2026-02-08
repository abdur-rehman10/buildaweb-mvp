import { Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PublishService } from './publish.service';

@Controller('projects/:projectId/publish')
@UseGuards(JwtAuthGuard)
export class PublishController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly publish: PublishService,
  ) {}

  @Post()
  async publishProject(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const result = await this.publish.createAndPublish({ tenantId, projectId, ownerUserId });
      return ok(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish site';
      throw new HttpException(fail('PUBLISH_FAILED', message), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('latest')
  async getLatestPublish(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const latestPublishId = project.latestPublishId ? String(project.latestPublishId) : null;
    if (!latestPublishId) {
      return ok(null);
    }

    const publish = await this.publish.getByIdScoped({
      tenantId,
      projectId,
      ownerUserId,
      publishId: latestPublishId,
    });

    if (!publish) {
      return ok(null);
    }

    return ok({
      publishId: String(publish._id),
      status: publish.status,
      url: publish.baseUrl,
      timestamp: publish.updatedAt ?? publish.createdAt ?? null,
      ...(publish.errorMessage ? { errorMessage: publish.errorMessage } : {}),
    });
  }

  @Get(':publishId')
  async getPublishStatus(@Param('projectId') projectId: string, @Param('publishId') publishId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const publish = await this.publish.getByIdScoped({ tenantId, projectId, ownerUserId, publishId });
    if (!publish) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    return ok({
      publishId: String(publish._id),
      status: publish.status,
      url: publish.baseUrl,
      ...(publish.errorMessage ? { errorMessage: publish.errorMessage } : {}),
    });
  }
}
