import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('health')
  health() {
    return {
      ok: true,
      service: 'buildaweb-api',
      ts: new Date().toISOString(),
      git_sha: process.env.GIT_SHA ?? 'unknown',
      build_time_utc: process.env.BUILD_TIME_UTC ?? 'unknown',
    };
  }

  @Get('db/ping')
  dbPing() {
    const state = this.connection.readyState;
    return {
      ok: state === ConnectionStates.connected,
      mongoReadyState: state,
      db: this.connection.name,
      ts: new Date().toISOString(),
    };
  }
}
