import { Model } from 'mongoose';
import { AssetDocument } from './asset.schema';
import { AssetsService } from './assets.service';
import { MinioService } from './minio.service';

type MockAssetModel = {
  find: jest.Mock;
};

describe('AssetsService.listByProjectScoped', () => {
  let service: AssetsService;
  let assetModel: MockAssetModel;

  beforeEach(() => {
    assetModel = {
      find: jest.fn(),
    };

    service = new AssetsService(
      assetModel as unknown as Model<AssetDocument>,
      {} as MinioService,
    );
  });

  it('returns an empty array when no assets exist', async () => {
    assetModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });

    const result = await service.listByProjectScoped({
      tenantId: 'default',
      projectId: '507f1f77bcf86cd799439011',
    });

    expect(result).toEqual([]);
  });

  it('returns mapped asset metadata fields when assets exist', async () => {
    const createdAt = new Date('2026-02-08T08:00:00.000Z');
    assetModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: '507f1f77bcf86cd799439021',
          fileName: 'hero.jpg',
          storagePath: 'tenants/default/projects/507f1f77bcf86cd799439011/assets/hero.jpg',
          sizeBytes: 12345,
          publicUrl: 'http://localhost:9000/bucket/hero.jpg',
          createdAt,
        },
      ]),
    });

    const result = await service.listByProjectScoped({
      tenantId: 'default',
      projectId: '507f1f77bcf86cd799439011',
    });

    expect(result).toEqual([
      {
        id: '507f1f77bcf86cd799439021',
        fileName: 'hero.jpg',
        size: 12345,
        publicUrl: 'http://localhost:9000/bucket/hero.jpg',
        createdAt,
      },
    ]);
  });
});
