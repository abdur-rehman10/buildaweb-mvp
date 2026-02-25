import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { SetLatestPublishDto } from './dto/set-latest-publish.dto';
import { PublishPreflightError, PublishService } from './publish.service';

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

    const project = await this.projects.getByIdScoped({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!project) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const result = await this.publish.createAndPublish({
        tenantId,
        projectId,
        ownerUserId,
      });
      return ok(result);
    } catch (error) {
      if (error instanceof PublishPreflightError) {
        throw new HttpException(
          {
            ok: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const message =
        error instanceof Error ? error.message : 'Failed to publish site';
      throw new HttpException(
        fail('PUBLISH_FAILED', message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('latest')
  async getLatestPublish(
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!project) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const latestPublishId = project.latestPublishId
      ? String(project.latestPublishId)
      : null;
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

    const publishedSlug =
      typeof project.publishedSlug === 'string'
        ? project.publishedSlug.trim()
        : '';
    const publishedUrl = publishedSlug
      ? this.publish.publicSiteUrlFromSlug(publishedSlug)
      : null;

    return ok({
      publishId: String(publish._id),
      status: publish.status,
      slug: publishedSlug || null,
      url: publishedUrl ?? '',
      baseUrl: publish.baseUrl,
      publishedSlug: publishedSlug || null,
      publishedUrl,
      timestamp: publish.updatedAt ?? publish.createdAt ?? null,
      ...(publish.errorMessage ? { errorMessage: publish.errorMessage } : {}),
    });
  }

  @Get(':publishId')
  async getPublishStatus(
    @Param('projectId') projectId: string,
    @Param('publishId') publishId: string,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!project) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const publish = await this.publish.getByIdScoped({
      tenantId,
      projectId,
      ownerUserId,
      publishId,
    });
    if (!publish) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const publishedSlug =
      typeof project.publishedSlug === 'string'
        ? project.publishedSlug.trim()
        : '';
    const publishedUrl = publishedSlug
      ? this.publish.publicSiteUrlFromSlug(publishedSlug)
      : null;

    return ok({
      publishId: String(publish._id),
      status: publish.status,
      slug: publishedSlug || null,
      url: publishedUrl ?? '',
      baseUrl: publish.baseUrl,
      publishedSlug: publishedSlug || null,
      publishedUrl,
      ...(publish.errorMessage ? { errorMessage: publish.errorMessage } : {}),
    });
  }

  @Put('latest')
  async setLatestPublish(
    @Param('projectId') projectId: string,
    @Body() dto: SetLatestPublishDto,
    @Req() req: any,
  ) {
    if (
      typeof dto.publishId !== 'string' ||
      dto.publishId.trim().length === 0
    ) {
      throw new HttpException(
        fail('BAD_REQUEST', 'publishId is required'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';
    const publishId = dto.publishId.trim();

    const project = await this.projects.getByIdScoped({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!project) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (!Types.ObjectId.isValid(publishId)) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const publish = await this.publish.getByIdScoped({
      tenantId,
      projectId,
      ownerUserId,
      publishId,
    });
    if (!publish) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedProject = await this.projects.setLatestPublish({
      tenantId,
      ownerUserId,
      projectId,
      publishId,
      publishedAt: new Date(),
    });
    if (!updatedProject) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return ok({
      project: {
        id: String(updatedProject._id),
        name: updatedProject.name,
        status: updatedProject.status,
        defaultLocale: updatedProject.defaultLocale,
        latestPublishId: updatedProject.latestPublishId
          ? String(updatedProject.latestPublishId)
          : null,
        publishedAt: updatedProject.publishedAt ?? null,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt,
      },
    });
  }
}
