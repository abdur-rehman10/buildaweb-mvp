import { Body, Controller, Get, HttpException, HttpStatus, Param, Put, Req, UseGuards } from '@nestjs/common';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InvalidPageReferenceException, NavigationService } from './navigation.service';

@Controller('projects/:projectId/navigation')
@UseGuards(JwtAuthGuard)
export class NavigationController {
  constructor(
    private readonly navigation: NavigationService,
    private readonly projects: ProjectsService,
  ) {}

  @Get()
  async getNavigation(@Param('projectId') projectId: string, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const nav = await this.navigation.getOrCreateByProject({
      tenantId,
      projectId,
      ownerUserId,
    });

    return ok(nav);
  }

  @Put()
  async putNavigation(@Param('projectId') projectId: string, @Body() dto: UpdateNavigationDto, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    try {
      const nav = await this.navigation.upsertByProject({
        tenantId,
        projectId,
        ownerUserId,
        items: dto.items,
        cta: dto.cta,
      });

      return ok(nav);
    } catch (error) {
      if (error instanceof InvalidPageReferenceException) {
        throw new HttpException(
          fail('INVALID_PAGE_REFERENCE', 'One or more pageIds do not belong to this project'),
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }
}
