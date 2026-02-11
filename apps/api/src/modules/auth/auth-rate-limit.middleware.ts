import { Injectable, NestMiddleware } from '@nestjs/common';
import { fail } from '../../common/api-response';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, Bucket>();

  private windowMs() {
    const parsed = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 60_000);
    if (!Number.isFinite(parsed) || parsed <= 0) return 60_000;
    return parsed;
  }

  private maxRequests() {
    const parsed = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 60);
    if (!Number.isFinite(parsed) || parsed <= 0) return 60;
    return Math.floor(parsed);
  }

  private requestIp(req: Record<string, unknown>) {
    const forwardedFor = req.headers as Record<string, unknown> | undefined;
    const xff = forwardedFor?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.trim()) {
      const first = xff.split(',')[0]?.trim();
      if (first) return first;
    }

    const ip = req.ip;
    if (typeof ip === 'string' && ip.trim()) return ip.trim();

    const connection = req.connection as { remoteAddress?: unknown } | undefined;
    if (typeof connection?.remoteAddress === 'string' && connection.remoteAddress.trim()) {
      return connection.remoteAddress.trim();
    }

    return 'unknown';
  }

  private maybePruneOldBuckets(now: number) {
    if (this.buckets.size < 500) return;
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  use(req: Record<string, unknown>, res: any, next: () => void) {
    const now = Date.now();
    const windowMs = this.windowMs();
    const max = this.maxRequests();
    const path = typeof req.originalUrl === 'string' ? req.originalUrl : '';
    const key = `${this.requestIp(req)}:${path.split('?')[0] ?? ''}`;

    const existing = this.buckets.get(key);
    const bucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : existing;

    bucket.count += 1;
    this.buckets.set(key, bucket);
    this.maybePruneOldBuckets(now);

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json(fail('RATE_LIMITED', 'Too many requests. Please try again shortly.'));
    }

    return next();
  }
}
