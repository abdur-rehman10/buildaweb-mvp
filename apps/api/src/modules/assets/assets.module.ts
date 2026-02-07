import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { Asset, AssetSchema } from './asset.schema';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { MinioService } from './minio.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]), ProjectsModule],
  controllers: [AssetsController],
  providers: [AssetsService, MinioService],
  exports: [AssetsService],
})
export class AssetsModule {}
