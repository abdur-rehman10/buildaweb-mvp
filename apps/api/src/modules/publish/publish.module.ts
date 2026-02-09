import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsModule } from '../assets/assets.module';
import { Navigation, NavigationSchema } from '../navigation/navigation.schema';
import { Page, PageSchema } from '../pages/page.schema';
import { PagesModule } from '../pages/pages.module';
import { Project, ProjectSchema } from '../projects/project.schema';
import { ProjectsModule } from '../projects/projects.module';
import { PublishController } from './publish.controller';
import { PublishesController } from './publishes.controller';
import { Publish, PublishSchema } from './publish.schema';
import { PublishService } from './publish.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publish.name, schema: PublishSchema },
      { name: Page.name, schema: PageSchema },
      { name: Navigation.name, schema: NavigationSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    ProjectsModule,
    PagesModule,
    AssetsModule,
  ],
  controllers: [PublishController, PublishesController],
  providers: [PublishService],
  exports: [PublishService],
})
export class PublishModule {}
