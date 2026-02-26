import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { AuthRequest } from '../../types/auth-request';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

type MockAuthService = {
  signup: jest.Mock;
  login: jest.Mock;
  forgotPassword: jest.Mock;
  resetPassword: jest.Mock;
};

type MockUsersService = {
  safeById: jest.Mock;
};

describe('AuthController auth endpoints', () => {
  let app: INestApplication;
  let authService: MockAuthService;
  let usersService: MockUsersService;
  let jwt: JwtService;

  const getServer = () => app.getHttpServer() as Parameters<typeof request>[0];

  const asOkBody = (value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error('Invalid body');
    const record = value as { ok?: unknown; data?: unknown };
    return record;
  };

  beforeEach(async () => {
    authService = {
      signup: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    usersService = {
      safeById: jest.fn(),
    };

    jwt = new JwtService({ secret: 'test-jwt-secret' });

    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwt },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue({
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
    });

    const moduleRef = await moduleBuilder.compile();

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

  it('supports signup, register alias, login, and protected /me', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    authService.signup.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        tenantId: 'default',
      },
      accessToken: token,
    });

    usersService.safeById.mockResolvedValue({
      _id: 'user-1',
      email: 'new@example.com',
      name: 'New User',
      tenantId: 'default',
      status: 'active',
    });

    const signupRes = await request(getServer())
      .post('/api/v1/auth/signup')
      .send({
        email: 'new@example.com',
        password: 'Password123',
        name: 'New User',
      });

    expect(signupRes.status).toBe(201);
    const signupBody = asOkBody(signupRes.body as unknown);
    expect(signupBody.ok).toBe(true);
    expect((signupBody.data as { accessToken?: unknown }).accessToken).toBe(
      token,
    );

    const registerRes = await request(getServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'new@example.com',
        password: 'Password123',
        name: 'New User',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toEqual(signupRes.body);

    authService.login.mockResolvedValue({
      ok: true,
      user: {
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        tenantId: 'default',
      },
      accessToken: token,
    });

    const loginRes = await request(getServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'new@example.com',
        password: 'Password123',
      });

    expect(loginRes.status).toBe(201);
    const loginBody = asOkBody(loginRes.body as unknown);
    expect(loginBody.ok).toBe(true);
    expect((loginBody.data as { accessToken?: unknown }).accessToken).toBe(
      token,
    );

    const meUnauthorizedRes = await request(getServer()).get('/api/v1/auth/me');

    expect(meUnauthorizedRes.status).toBe(401);

    const signupToken = (signupBody.data as { accessToken?: unknown })
      .accessToken;
    const accessToken = typeof signupToken === 'string' ? signupToken : '';

    const meRes = await request(getServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    const meBody = asOkBody(meRes.body as unknown);
    expect(meBody.ok).toBe(true);
    expect((meBody.data as { user?: unknown }).user).toEqual({
      id: 'user-1',
      email: 'new@example.com',
      name: 'New User',
      tenantId: 'default',
    });
  });

  it('returns 409 for duplicate email', async () => {
    authService.signup.mockResolvedValue({
      ok: false,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already in use',
    });

    const res = await request(getServer()).post('/api/v1/auth/signup').send({
      email: 'dup@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      ok: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already in use',
      },
    });
  });

  it('returns 400 for invalid email and short password', async () => {
    const res = await request(getServer()).post('/api/v1/auth/signup').send({
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});
