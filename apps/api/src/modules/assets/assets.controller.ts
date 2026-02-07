import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fail, ok } from '../../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { AssetsService, MAX_UPLOAD_SIZE_BYTES } from './assets.service';
import { ResolveAssetsDto } from './dto/resolve-assets.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
};

@Controller('projects/:projectId/assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(
    private readonly assets: AssetsService,
    private readonly projects: ProjectsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: UploadedImageFile | undefined,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    if (!file) {
      throw new HttpException(fail('FILE_REQUIRED', 'File is required'), HttpStatus.BAD_REQUEST);
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new HttpException(fail('INVALID_FILE_TYPE', 'Only image uploads are allowed'), HttpStatus.BAD_REQUEST);
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new HttpException(fail('FILE_TOO_LARGE', 'Max file size is 5MB'), HttpStatus.BAD_REQUEST);
    }

    try {
      const uploaded = await this.assets.uploadImage({
        tenantId,
        projectId,
        file,
      });

      return ok(uploaded);
    } catch {
      throw new HttpException(fail('UPLOAD_FAILED', 'Failed to upload asset'), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('resolve')
  async resolve(
    @Param('projectId') projectId: string,
    @Body() dto: ResolveAssetsDto,
    @Req() req: any,
  ) {
    const ownerUserId = req.user?.sub as string;
    const tenantId = (req.user?.tenantId as string | undefined) ?? 'default';

    const project = await this.projects.getByIdScoped({ tenantId, ownerUserId, projectId });
    if (!project) {
      throw new HttpException(fail('NOT_FOUND', 'Not found'), HttpStatus.NOT_FOUND);
    }

    const assets = await this.assets.getByIdsScoped({
      tenantId,
      projectId,
      assetIds: dto.assetIds,
    });

    return ok({
      items: assets.map((asset) => ({
        assetId: String(asset._id),
        publicUrl: asset.publicUrl,
      })),
    });
  }
}
