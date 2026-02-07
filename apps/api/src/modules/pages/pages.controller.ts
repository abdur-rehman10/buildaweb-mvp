import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ok, fail } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { LastPageForbiddenException, PageSlugConflictException, PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdatePageMetaDto } from './dto/update-page-meta.dto';
import { DuplicatePageDto } from './dto/duplicate-page.dto';

@Controller('projects/:projectId/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(
    private readonly pages: PagesService,
    private readonly projects: ProjectsService,
  ) {}

  @Post()
  async createPage(@Param('projectId') projectId: string, @Body() dto: CreatePageDto, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const page = await this.pages.createPage({
        tenantId,
        projectId,
        title: dto.title,
        slug: dto.slug,
        isHome: dto.isHome,
      });

      return ok({ page_id: String(page._id) });
    } catch (error) {
      if (error instanceof PageSlugConflictException || error instanceof ConflictException) {
        throw new HttpException(fail('SLUG_ALREADY_EXISTS', 'Slug already exists'), HttpStatus.CONFLICT);
      }

      throw error;
    }
  }

  @Get(':pageId')
  async getPage(@Param('projectId') projectId: string, @Param('pageId') pageId: string, @Req() req: any) {
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

    return ok({ page });
  }

  @Patch(':pageId/meta')
  async updatePageMeta(
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageMetaDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const page = await this.pages.updatePageMeta({
        tenantId,
        projectId,
        pageId,
        title: dto.title,
        slug: dto.slug,
        seoJson: dto.seoJson,
      });

      return ok({ page });
    } catch (error) {
      if (error instanceof PageSlugConflictException || error instanceof ConflictException) {
        throw new HttpException(fail('SLUG_ALREADY_EXISTS', 'Slug already exists'), HttpStatus.CONFLICT);
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }

  @Post(':pageId/duplicate')
  async duplicatePage(
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Body() dto: DuplicatePageDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const duplicated = await this.pages.duplicatePage({
        tenantId,
        projectId,
        pageId,
        title: dto.title,
        slug: dto.slug,
      });

      return ok({ page_id: String(duplicated._id) });
    } catch (error) {
      if (error instanceof PageSlugConflictException || error instanceof ConflictException) {
        throw new HttpException(fail('SLUG_ALREADY_EXISTS', 'Slug already exists'), HttpStatus.CONFLICT);
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }

  @Put(':pageId')
  async updatePage(
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const updated = await this.pages.updatePageJson({
        tenantId,
        projectId,
        pageId,
        page: { editorJson: dto.page },
        version: dto.version,
      });

      return ok({ page_id: String(updated._id), version: updated.version });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          fail('VERSION_CONFLICT', 'Page changed elsewhere'),
          HttpStatus.CONFLICT,
        );
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }

  @Delete(':pageId')
  async deletePage(@Param('projectId') projectId: string, @Param('pageId') pageId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      await this.pages.deletePage({ tenantId, projectId, pageId });
      return ok({ deleted: true });
    } catch (error) {
      if (error instanceof LastPageForbiddenException) {
        throw new HttpException(
          fail('LAST_PAGE_FORBIDDEN', 'Cannot delete last remaining page'),
          HttpStatus.CONFLICT,
        );
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
      }

      throw error;
    }
  }
}
