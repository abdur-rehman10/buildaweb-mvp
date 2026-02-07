import {
  Body,
  ConflictException,
  Controller,
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
import { ok, fail } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

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

    const page = await this.pages.createPage({
      tenantId,
      projectId,
      title: dto.title,
      slug: dto.slug,
      isHome: dto.isHome,
    });

    return ok({ page_id: String(page._id) });
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
}
