import { AuthRateLimitMiddleware } from './auth-rate-limit.middleware';

describe('AuthRateLimitMiddleware', () => {
  const originalMax = process.env.AUTH_RATE_LIMIT_MAX;
  const originalWindowMs = process.env.AUTH_RATE_LIMIT_WINDOW_MS;

  afterEach(() => {
    if (originalMax === undefined) {
      delete process.env.AUTH_RATE_LIMIT_MAX;
    } else {
      process.env.AUTH_RATE_LIMIT_MAX = originalMax;
    }

    if (originalWindowMs === undefined) {
      delete process.env.AUTH_RATE_LIMIT_WINDOW_MS;
    } else {
      process.env.AUTH_RATE_LIMIT_WINDOW_MS = originalWindowMs;
    }
  });

  it('returns 429 after limit is exceeded', () => {
    process.env.AUTH_RATE_LIMIT_MAX = '2';
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';

    const middleware = new AuthRateLimitMiddleware();
    const req = {
      ip: '127.0.0.1',
      originalUrl: '/api/v1/auth/login',
      headers: {},
      connection: {},
    };
    const status = jest.fn().mockReturnThis();
    const json = jest.fn().mockReturnThis();
    const setHeader = jest.fn();
    const res = { status, json, setHeader };
    const next = jest.fn();

    middleware.use(req, res, next);
    middleware.use(req, res, next);
    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again shortly.',
      },
    });
    expect(setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });
});
