import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('health')
  health() {
    return { ok: true, service: 'buildaweb-api', ts: new Date().toISOString() };
  }

  @Get('db/ping')
  async dbPing() {
    const state = this.connection.readyState; // 1 = connected
    return {
      ok: state === 1,
      mongoReadyState: state,
      db: this.connection.name,
      ts: new Date().toISOString(),
    };
  }
}
