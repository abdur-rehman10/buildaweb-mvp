import { AppController, HealthResponse } from './app.controller';
import { Connection } from 'mongoose';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    const connectionMock = {
      readyState: 1,
      name: 'test',
    } as Connection;

    appController = new AppController(connectionMock);
  });

  describe('health', () => {
    it('should return API health payload', () => {
      const result: HealthResponse = appController.health();

      expect(result).toMatchObject({
        ok: true,
        service: 'buildaweb-api',
        git_sha: 'unknown',
        build_time_utc: 'unknown',
      });
      expect(result.ts).toEqual(expect.any(String));
    });
  });
});
