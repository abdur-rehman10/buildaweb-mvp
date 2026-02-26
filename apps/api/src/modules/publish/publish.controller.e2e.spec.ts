import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'http';
import type { AuthRequest } from '../../types/auth-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';

type MockProjectsService = {
  getByIdScoped: jest.Mock;
  setLatestPublish: jest.Mock;
};

type MockPublishService = {
  createAndPublish: jest.Mock;
  getByIdScoped: jest.Mock;
  publicSiteUrlFromSlug: jest.Mock;
};

describe('PublishController contract (request)', () => {
  let app: INestApplication;
  let projectsService: MockProjectsService;
  let publishService: MockPublishService;
  let jwt: JwtService;

  beforeEach(async () => {
    projectsService = {
      getByIdScoped: jest.fn().mockResolvedValue({ _id: 'project-1' }),
      setLatestPublish: jest.fn(),
    };

    publishService = {
      createAndPublish: jest.fn().mockResolvedValue({
        publishId: 'publish-1',
        status: 'live',
        slug: 'main-site',
        url: 'http://13.50.101.211/p/main-site',
        publishedUrl: 'http://13.50.101.211/p/main-site',
        publishedSlug: 'main-site',
      }),
      getByIdScoped: jest.fn(),
      publicSiteUrlFromSlug: jest.fn(),
    };

    jwt = new JwtService({ secret: 'test-jwt-secret' });

    const moduleRef = await Test.createTestingModule({
      controllers: [PublishController],
      providers: [
        { provide: ProjectsService, useValue: projectsService },
        { provide: PublishService, useValue: publishService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthRequest>();
          const authHeader = req.headers?.authorization;
          if (
            typeof authHeader !== 'string' ||
            !authHeader.startsWith('Bearer ')
          ) {
            throw new UnauthorizedException();
          }

          const token = authHeader.slice('Bearer '.length).trim();
          const decoded: unknown = jwt.verify(token);
          if (!decoded || typeof decoded !== 'object') {
            throw new UnauthorizedException();
          }
          req.user = decoded as AuthRequest['user'];
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns publish slug and /p/ url contract', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const response = await request(server as never)
      .post('/api/v1/projects/project-1/publish')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(201);
    const body = response.body as unknown;
    if (!body || typeof body !== 'object') throw new Error('Invalid body');
    const data = (body as { data?: unknown }).data as
      | Record<string, unknown>
      | undefined;
    expect((body as { ok?: unknown }).ok).toBe(true);
    expect(data?.publishId).toBe('publish-1');
    expect(data?.status).toBe('live');
    expect(data?.slug).toBe('main-site');
    expect(data?.url).toBe('http://13.50.101.211/p/main-site');
    const url = typeof data?.url === 'string' ? data.url : '';
    expect(url).toContain('/p/');
    expect(url).not.toContain('127.0.0.1');
    expect(url).not.toContain('localhost');
  });
});
