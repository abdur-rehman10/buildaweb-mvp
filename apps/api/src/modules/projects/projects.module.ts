import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthRateLimitMiddleware } from '../auth/auth-rate-limit.middleware';
import { AiModule } from '../ai/ai.module';
import { Navigation, NavigationSchema } from '../navigation/navigation.schema';
import { Page, PageSchema } from '../pages/page.schema';
import { Publish, PublishSchema } from '../publish/publish.schema';
import { Project, ProjectSchema } from './project.schema';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Page.name, schema: PageSchema },
      { name: Navigation.name, schema: NavigationSchema },
      { name: Publish.name, schema: PublishSchema },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthRateLimitMiddleware).forRoutes({
      path: 'projects/:projectId/generate',
      method: RequestMethod.POST,
    });
  }
}
