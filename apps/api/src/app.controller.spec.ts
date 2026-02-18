import { AppController } from './app.controller';
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
      const result = appController.health();

      expect(result).toMatchObject({
        ok: true,
        service: 'buildaweb-api',
      });
      expect(result.ts).toEqual(expect.any(String));
    });
  });
});
