import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { ok, fail } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SetHomePageDto } from './dto/set-home-page.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  private isValidObjectId(value: string) {
    return Types.ObjectId.isValid(value);
  }

  @Post()
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.create({
      tenantId,
      ownerUserId,
      name: dto.name,
      defaultLocale: dto.defaultLocale ?? 'en',
    });

    return ok({ project_id: String(project._id) });
  }

  @Get()
  async listProjects(@Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const projects = await this.projects.listByOwner({ tenantId, ownerUserId });

    return ok({
      projects: projects.map((project) => ({
        id: String(project._id),
        name: project.name,
        status: project.status,
        defaultLocale: project.defaultLocale,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    });
  }

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    return ok({
      project: {
        id: String(project._id),
        name: project.name,
        status: project.status,
        defaultLocale: project.defaultLocale,
        homePageId: project.homePageId ? String(project.homePageId) : null,
        latestPublishId: project.latestPublishId ? String(project.latestPublishId) : null,
        publishedAt: project.publishedAt ?? null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  }

  @Put(':projectId/home')
  async setProjectHomePage(
    @Param('projectId') projectId: string,
    @Body() dto: SetHomePageDto,
    @Req() req: any,
  ) {
    if (!this.isValidObjectId(projectId)) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const result = await this.projects.setHomePage({
        tenantId,
        ownerUserId,
        projectId,
        pageId: dto.pageId,
      });

      return ok({
        homePageId: result.pageId,
        slug: '/',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }
}
