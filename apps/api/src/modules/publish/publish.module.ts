import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsModule } from '../assets/assets.module';
import { Page, PageSchema } from '../pages/page.schema';
import { PagesModule } from '../pages/pages.module';
import { ProjectsModule } from '../projects/projects.module';
import { PublishController } from './publish.controller';
import { Publish, PublishSchema } from './publish.schema';
import { PublishService } from './publish.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publish.name, schema: PublishSchema },
      { name: Page.name, schema: PageSchema },
    ]),
    ProjectsModule,
    PagesModule,
    AssetsModule,
  ],
  controllers: [PublishController],
  providers: [PublishService],
  exports: [PublishService],
})
export class PublishModule {}
