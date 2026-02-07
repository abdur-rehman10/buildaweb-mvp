import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsModule } from '../assets/assets.module';
import { Page, PageSchema } from './page.schema';
import { PagesService } from './pages.service';
import { ProjectsModule } from '../projects/projects.module';
import { PagesController } from './pages.controller';
import { PreviewController } from './preview.controller';
import { PreviewRendererService } from './preview-renderer.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]), ProjectsModule, AssetsModule],
  controllers: [PagesController, PreviewController],
  providers: [PagesService, PreviewRendererService],
  exports: [PagesService],
})
export class PagesModule {}
