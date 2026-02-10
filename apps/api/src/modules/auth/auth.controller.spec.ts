import { ExecutionContext, INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
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

describe('AuthController signup hardening', () => {
  let app: INestApplication;
  let authService: MockAuthService;
  let usersService: MockUsersService;
  let jwt: JwtService;

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
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers?.authorization;
        if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException();
        }

        const token = authHeader.slice('Bearer '.length).trim();
        req.user = jwt.verify(token);
        return true;
      },
    });

    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates user, returns token, and allows /auth/me with that token', async () => {
    const token = await jwt.signAsync({ sub: 'user-1', tenantId: 'default' });

    authService.signup.mockResolvedValue({
      ok: true,
      user: { id: 'user-1', email: 'new@example.com', name: 'New User', tenantId: 'default' },
      accessToken: token,
    });

    usersService.safeById.mockResolvedValue({
      _id: 'user-1',
      email: 'new@example.com',
      name: 'New User',
      tenantId: 'default',
      status: 'active',
    });

    const signupRes = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      email: 'new@example.com',
      password: 'Password123',
      name: 'New User',
    });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body.ok).toBe(true);
    expect(signupRes.body.data.accessToken).toBe(token);

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${signupRes.body.data.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.ok).toBe(true);
    expect(meRes.body.data.user.email).toBe('new@example.com');
  });

  it('returns 409 for duplicate email', async () => {
    authService.signup.mockResolvedValue({
      ok: false,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already in use',
    });

    const res = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
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
    const res = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});
