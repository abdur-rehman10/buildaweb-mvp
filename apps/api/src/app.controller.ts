import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('health')
  health() {
    return { ok: true, service: 'buildaweb-api', ts: new Date().toISOString() };
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
