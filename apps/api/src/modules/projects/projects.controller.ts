import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { ok, fail } from '../../common/api-response';
import {
  AiGenerationError,
  AiInvalidJsonError,
  AiService,
} from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GenerateProjectDto } from './dto/generate-project.dto';
import { SetHomePageDto } from './dto/set-home-page.dto';
import { UpdateProjectSettingsDto } from './dto/update-project-settings.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly ai: AiService,
    private readonly config: ConfigService,
  ) {}

  private isValidObjectId(value: string) {
    return Types.ObjectId.isValid(value);
  }

  @Post()
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    let project;
    try {
      project = await this.projects.create({
        tenantId,
        ownerUserId,
        name: dto.name,
        defaultLocale: dto.defaultLocale ?? 'en',
      });
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new HttpException(
          fail('PROJECT_ALREADY_EXISTS', 'User already has a project'),
          HttpStatus.FORBIDDEN,
        );
      }
      throw error;
    }

    return ok({ project_id: String(project._id) });
  }

  @Post(':projectId/generate')
  async generateProject(
    @Param('projectId') projectId: string,
    @Body() dto: GenerateProjectDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';
    const prompt = dto.prompt.trim();

    if (!prompt) {
      throw new HttpException(
        fail('INVALID_PROMPT', 'Prompt is required'),
        HttpStatus.BAD_REQUEST,
      );
    }

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
      const generated = await this.ai.generateSiteFromPrompt(prompt);
      await this.projects.replaceProjectContentFromGeneration({
        tenantId,
        ownerUserId,
        projectId,
        generated,
      });

      const publicAppUrl =
        this.config.get<string>('PUBLIC_APP_URL')?.trim().replace(/\/$/, '') ??
        '';
      const previewUrl = publicAppUrl
        ? `${publicAppUrl}/editor/${projectId}`
        : `/editor/${projectId}`;

      return ok({
        success: true,
        projectId,
        previewUrl,
      });
    } catch (error) {
      if (error instanceof AiInvalidJsonError) {
        throw new HttpException(
          fail('AI_INVALID_JSON', 'AI returned invalid JSON'),
          HttpStatus.BAD_GATEWAY,
        );
      }

      if (error instanceof AiGenerationError) {
        throw new HttpException(
          fail('AI_GENERATION_FAILED', 'Failed to generate site'),
          HttpStatus.BAD_GATEWAY,
        );
      }

      const message =
        error instanceof Error ? error.message : 'Failed to generate site';
      throw new HttpException(
        fail('GENERATE_FAILED', message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async listProjects(@Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const projects = await this.projects.listByOwnerWithDraftStatus({
      tenantId,
      ownerUserId,
    });

    return ok({
      projects: projects.map((entry) => ({
        id: String(entry.project._id),
        name: entry.project.name,
        status: entry.project.status,
        defaultLocale: entry.project.defaultLocale,
        homePageId: entry.project.homePageId
          ? String(entry.project.homePageId)
          : null,
        latestPublishId: entry.project.latestPublishId
          ? String(entry.project.latestPublishId)
          : null,
        publishedAt: entry.project.publishedAt ?? null,
        siteName: entry.project.siteName ?? null,
        logoAssetId: entry.project.logoAssetId ?? null,
        faviconAssetId: entry.project.faviconAssetId ?? null,
        defaultOgImageAssetId: entry.project.defaultOgImageAssetId ?? null,
        locale: entry.project.locale ?? entry.project.defaultLocale ?? 'en',
        hasUnpublishedChanges: entry.hasUnpublishedChanges,
        createdAt: entry.project.createdAt,
        updatedAt: entry.project.updatedAt,
      })),
    });
  }

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const projectResult = await this.projects.getByIdScopedWithDraftStatus({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!projectResult) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    const project = projectResult.project;
    return ok({
      project: {
        id: String(project._id),
        name: project.name,
        status: project.status,
        defaultLocale: project.defaultLocale,
        homePageId: project.homePageId ? String(project.homePageId) : null,
        latestPublishId: project.latestPublishId
          ? String(project.latestPublishId)
          : null,
        publishedAt: project.publishedAt ?? null,
        siteName: project.siteName ?? null,
        logoAssetId: project.logoAssetId ?? null,
        faviconAssetId: project.faviconAssetId ?? null,
        defaultOgImageAssetId: project.defaultOgImageAssetId ?? null,
        locale: project.locale ?? project.defaultLocale ?? 'en',
        hasUnpublishedChanges: projectResult.hasUnpublishedChanges,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  }

  @Get(':projectId/settings')
  async getProjectSettings(
    @Param('projectId') projectId: string,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const settings = await this.projects.getSettings({
      tenantId,
      ownerUserId,
      projectId,
    });
    if (!settings) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return ok({ settings });
  }

  @Put(':projectId/settings')
  async updateProjectSettings(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectSettingsDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const settings = await this.projects.updateSettings({
      tenantId,
      ownerUserId,
      projectId,
      siteName: dto.siteName,
      logoAssetId: dto.logoAssetId,
      faviconAssetId: dto.faviconAssetId,
      defaultOgImageAssetId: dto.defaultOgImageAssetId,
      locale: dto.locale,
    });
    if (!settings) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return ok({ settings });
  }

  @Put(':projectId/home')
  async setProjectHomePage(
    @Param('projectId') projectId: string,
    @Body() dto: SetHomePageDto,
    @Req() req: any,
  ) {
    if (!this.isValidObjectId(projectId)) {
      throw new HttpException(
        fail('NOT_FOUND', 'Not found'),
        HttpStatus.NOT_FOUND,
      );
    }

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
        throw new HttpException(
          fail('NOT_FOUND', 'Not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
