import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './page.schema';
import { PagesService } from './pages.service';
import { ProjectsModule } from '../projects/projects.module';
import { PagesController } from './pages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]), ProjectsModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
