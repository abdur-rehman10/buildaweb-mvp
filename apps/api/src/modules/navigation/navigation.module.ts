import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PagesModule } from '../pages/pages.module';
import { ProjectsModule } from '../projects/projects.module';
import { NavigationController } from './navigation.controller';
import { Navigation, NavigationSchema } from './navigation.schema';
import { NavigationService } from './navigation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Navigation.name, schema: NavigationSchema }]),
    ProjectsModule,
    PagesModule,
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
