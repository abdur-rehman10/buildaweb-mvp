import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { extname } from 'node:path';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './asset.schema';
import { MinioService } from './minio.service';

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

type UploadImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
};

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    private readonly minio: MinioService,
  ) {}

  private extensionFromMimeType(mimeType: string, originalName?: string) {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/avif': 'avif',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
    };

    if (map[mimeType]) {
      return map[mimeType];
    }

    const originalExt = extname(originalName ?? '').replace('.', '').toLowerCase();
    return originalExt || 'bin';
  }

  async uploadImage(params: {
    tenantId: string;
    projectId: string;
    file: UploadImageFile;
  }) {
    const ext = this.extensionFromMimeType(params.file.mimetype, params.file.originalname);
    const objectId = randomUUID();
    const storagePath = `tenants/${params.tenantId}/projects/${params.projectId}/assets/${objectId}.${ext}`;

    const publicUrl = await this.minio.upload({
      objectPath: storagePath,
      buffer: params.file.buffer,
      mimeType: params.file.mimetype,
      sizeBytes: params.file.size,
    });

    const asset = await this.assetModel.create({
      tenantId: params.tenantId,
      projectId: params.projectId,
      storagePath,
      fileName: (params.file.originalname ?? '').trim() || `${objectId}.${ext}`,
      publicUrl,
      mimeType: params.file.mimetype,
      sizeBytes: params.file.size,
    });

    return {
      assetId: String(asset._id),
      publicUrl: asset.publicUrl,
    };
  }

  async listByProjectScoped(params: { tenantId: string; projectId: string }) {
    const assets = await this.assetModel
      .find({
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .sort({ createdAt: -1 })
      .select('_id fileName storagePath mimeType sizeBytes publicUrl createdAt')
      .lean()
      .exec();

    return assets.map((asset) => ({
      id: String(asset._id),
      fileName: (asset.fileName || '').trim() || basename(asset.storagePath || ''),
      mimeType: asset.mimeType ?? null,
      size: asset.sizeBytes,
      publicUrl: asset.publicUrl,
      createdAt: asset.createdAt,
    }));
  }

  async getByIdScoped(params: { tenantId: string; projectId: string; assetId: string }) {
    const asset = await this.assetModel
      .findOne({
        _id: params.assetId,
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .exec();

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async getByIdsScoped(params: { tenantId: string; projectId: string; assetIds: string[] }) {
    if (params.assetIds.length === 0) {
      return [];
    }

    return this.assetModel
      .find({
        _id: { $in: params.assetIds },
        tenantId: params.tenantId,
        projectId: params.projectId,
      })
      .exec();
  }
}
