import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'node:path';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PagesModule } from './modules/pages/pages.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(__dirname, '..', '.env'), '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI') || 'mongodb://localhost:27017/buildaweb',
      }),
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    PagesModule,
    NavigationModule,
    AssetsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
