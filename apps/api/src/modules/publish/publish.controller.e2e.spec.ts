import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
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
          const req = context.switchToHttp().getRequest();
          const authHeader = req.headers?.authorization;
          if (
            typeof authHeader !== 'string' ||
            !authHeader.startsWith('Bearer ')
          ) {
            throw new UnauthorizedException();
          }

          const token = authHeader.slice('Bearer '.length).trim();
          req.user = jwt.verify(token);
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
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns publish slug and /p/ url contract', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const response = await request(app.getHttpServer())
      .post('/api/v1/projects/project-1/publish')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      data: expect.objectContaining({
        publishId: 'publish-1',
        status: 'live',
        slug: 'main-site',
        url: 'http://13.50.101.211/p/main-site',
      }),
    });
    expect(response.body.data.url).toContain('/p/');
  });
});
