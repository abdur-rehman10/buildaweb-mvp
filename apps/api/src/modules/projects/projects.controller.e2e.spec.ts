import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'http';
import type { AuthRequest } from '../../types/auth-request';
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
      create: jest.fn(() => {
        if (createdProjectId) {
          return Promise.resolve({ _id: createdProjectId });
        }
        createdProjectId = 'project-1';
        return Promise.resolve({ _id: createdProjectId });
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
        projectId: 'project-1',
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
          const claims = decoded as Record<string, unknown>;
          req.user = {
            sub: typeof claims.sub === 'string' ? claims.sub : undefined,
            id: typeof claims.id === 'string' ? claims.id : undefined,
            tenantId:
              typeof claims.tenantId === 'string' ? claims.tenantId : undefined,
            email: typeof claims.email === 'string' ? claims.email : undefined,
            name: typeof claims.name === 'string' ? claims.name : undefined,
          };
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

  it('returns same project id when project creation is called twice', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const firstCreateResponse = await request(server as never)
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

    const secondCreateResponse = await request(server as never)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Second Project',
        defaultLocale: 'en',
      });

    expect(secondCreateResponse.status).toBe(201);
    expect(secondCreateResponse.body).toEqual({
      ok: true,
      data: {
        project_id: 'project-1',
      },
    });

    projectsService.listByOwnerWithDraftStatus.mockResolvedValue([
      {
        project: {
          _id: 'project-1',
          name: 'Main Project',
          status: 'draft',
          defaultLocale: 'en',
          homePageId: null,
          latestPublishId: null,
          publishedAt: null,
          siteName: null,
          logoAssetId: null,
          faviconAssetId: null,
          defaultOgImageAssetId: null,
          locale: 'en',
          createdAt: new Date('2026-02-08T09:00:00.000Z'),
          updatedAt: new Date('2026-02-08T09:00:00.000Z'),
        },
        hasUnpublishedChanges: true,
      },
    ]);

    const listResponse = await request(server as never)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    const listBody = listResponse.body as {
      ok: boolean;
      data: { projects: Array<Record<string, unknown>> };
    };
    expect(listBody.ok).toBe(true);
    expect(listBody.data.projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'project-1',
          name: 'Main Project',
          defaultLocale: 'en',
        }),
      ]),
    );
  });

  it('generates site content and returns previewUrl', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    const response = await request(server as never)
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

  it('generates site content without project id by resolving project for user', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    projectsService.createFromPrompt.mockResolvedValueOnce({
      homePageId: 'page-2',
      pageCount: 3,
      projectId: 'project-2',
    });

    const response = await request(server as never)
      .post('/api/v1/projects/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Create a personal blog website' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      data: {
        success: true,
        projectId: 'project-2',
        previewUrl: 'http://13.50.101.211/editor/project-2',
      },
    });

    expect(projectsService.createFromPrompt).toHaveBeenCalledWith({
      tenantId: 'default',
      ownerUserId: 'user-1',
      projectId: undefined,
      prompt: 'Create a personal blog website',
    });
  });
});
