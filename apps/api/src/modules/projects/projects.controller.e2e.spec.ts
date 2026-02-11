import {
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

type MockProjectsService = {
  create: jest.Mock;
  listByOwnerWithDraftStatus: jest.Mock;
  getByIdScopedWithDraftStatus: jest.Mock;
  getSettings: jest.Mock;
  updateSettings: jest.Mock;
  getByIdScoped: jest.Mock;
  setHomePage: jest.Mock;
  createFromPrompt: jest.Mock;
};

describe('ProjectsController single-project enforcement (request)', () => {
  let app: INestApplication;
  let projectsService: MockProjectsService;
  let jwt: JwtService;
  let createdProjectId: string | null;

  beforeEach(async () => {
    createdProjectId = null;

    projectsService = {
      create: jest.fn(async () => {
        if (createdProjectId) {
          throw new ForbiddenException('User already has a project');
        }
        createdProjectId = 'project-1';
        return { _id: createdProjectId };
      }),
      listByOwnerWithDraftStatus: jest.fn(),
      getByIdScopedWithDraftStatus: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      getByIdScoped: jest.fn(),
      setHomePage: jest.fn(),
      createFromPrompt: jest.fn().mockResolvedValue({
        homePageId: 'page-1',
        pageCount: 2,
      }),
    };

    jwt = new JwtService({ secret: 'test-jwt-secret' });

    const moduleRef = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: projectsService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://13.50.101.211') },
        },
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

  it('allows first project creation and blocks second project creation with 403', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const firstCreateResponse = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Main Project',
        defaultLocale: 'en',
      });

    expect(firstCreateResponse.status).toBe(201);
    expect(firstCreateResponse.body).toEqual({
      ok: true,
      data: {
        project_id: 'project-1',
      },
    });

    const secondCreateResponse = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Second Project',
        defaultLocale: 'en',
      });

    expect(secondCreateResponse.status).toBe(403);
    expect(secondCreateResponse.body).toEqual({
      ok: false,
      error: {
        code: 'PROJECT_ALREADY_EXISTS',
        message: 'User already has a project',
      },
    });
  });

  it('generates site content and returns previewUrl', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const response = await request(app.getHttpServer())
      .post('/api/v1/projects/project-1/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Create a SaaS landing site' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      data: {
        success: true,
        projectId: 'project-1',
        previewUrl: 'http://13.50.101.211/editor/project-1',
      },
    });
    expect(projectsService.createFromPrompt).toHaveBeenCalledWith({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: 'project-1',
      prompt: 'Create a SaaS landing site',
    });
  });
});
