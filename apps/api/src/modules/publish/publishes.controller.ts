import { Controller, Get, HttpException, HttpStatus, Param, Query, Req, UseGuards } from '@nestjs/common';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PublishService } from './publish.service';

@Controller('projects/:projectId/publishes')
@UseGuards(JwtAuthGuard)
export class PublishesController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly publish: PublishService,
  ) {}

  private parseLimit(raw?: string): number {
    if (!raw) return 10;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return 10;

    return Math.min(Math.floor(parsed), 100);
  }

  @Get()
  async listPublishes(@Param('projectId') projectId: string, @Query('limit') limitRaw: string | undefined, @Req() req: any) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const limit = this.parseLimit(limitRaw);
    const publishes = await this.publish.listByProjectScoped({
      tenantId,
      projectId,
      ownerUserId,
      limit,
    });

    return ok({
      publishes: publishes.map((entry) => ({
        publishId: String(entry._id),
        status: entry.status,
        createdAt: entry.createdAt ?? null,
        baseUrl: entry.baseUrl,
      })),
    });
  }
}
