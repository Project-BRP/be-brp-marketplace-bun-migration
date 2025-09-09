import type { Context, Next } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { Env } from '../constants';
import { ResponseError } from '../error/ResponseError';

// Optional Redis (ioredis) support for production
let RedisCtor: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RedisCtor = require('ioredis');
} catch (_) {
  RedisCtor = null;
}

interface RateRecord {
  count: number;
  last: number;
}

const memoryStore: Record<string, RateRecord> = {};

function getClient() {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (!url || !RedisCtor) return null;
  try {
    return new RedisCtor(url);
  } catch {
    return null;
  }
}

const redis = getClient();

async function hitKeyRedis(key: string, windowMs: number) {
  if (!redis) return null;
  const ttl = Math.ceil(windowMs / 1000);
  const pipe = redis.multi();
  pipe.incr(key);
  pipe.expire(key, ttl);
  const [count] = await pipe.exec().then((res: any[]) => [res?.[0]?.[1] || 0]);
  return Number(count || 0);
}

function hitKeyMemory(key: string, windowMs: number) {
  const now = Date.now();
  const rec = memoryStore[key];
  if (!rec || now - rec.last > windowMs) {
    memoryStore[key] = { count: 1, last: now };
    return 1;
  }
  rec.count += 1;
  return rec.count;
}

function limiter(options: { windowMs: number; max: number }) {
  const { windowMs, max } = options;
  return async (c: Context, next: Next) => {
    if (
      process.env.NODE_ENV === Env.DEVELOPMENT ||
      process.env.NODE_ENV === Env.TESTING
    ) {
      return next();
    }
    const ip =
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for') ||
      (c.req as any).ip ||
      'unknown';
    const key = `rl:${ip}:${c.req.method}:${new URL(c.req.url).pathname}`;
    const count = redis
      ? await hitKeyRedis(key, windowMs)
      : hitKeyMemory(key, windowMs);
    if ((count || 0) > max) {
      throw new ResponseError(
        StatusCodes.TOO_MANY_REQUESTS,
        'Terlalu banyak permintaan, silakan coba lagi nanti',
      );
    }
    await next();
  };
}

export class RateLimiter {
  static readonly registerLimiter = limiter({ windowMs: 60 * 1000, max: 1 });
  static readonly verifyEmailLimiter = limiter({ windowMs: 60 * 1000, max: 1 });
  static readonly loginLimiter = limiter({ windowMs: 60 * 1000, max: 5 });
  static readonly forgotPasswordLimiter = limiter({
    windowMs: 60 * 1000,
    max: 1,
  });
  static readonly resetPasswordLimiter = limiter({
    windowMs: 60 * 1000,
    max: 1,
  });
}
