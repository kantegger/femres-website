import { jsonResponse } from './api';

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
  request: Request;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
}

const store = new Map<string, RateLimitEntry>();

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || 'unknown';
};

const cleanupExpiredEntries = (now: number) => {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
};

export function checkRateLimit({
  key,
  limit,
  windowMs,
  request
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const clientIp = getClientIp(request);
  const storeKey = `${key}:${clientIp}`;
  const existing = store.get(storeKey);

  if (!existing || existing.resetAt <= now) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      allowed: true,
      retryAfter: 0,
      remaining: limit - 1
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfter: 0,
    remaining: Math.max(0, limit - existing.count)
  };
}

export function rateLimitResponse(retryAfter: number): Response {
  return jsonResponse(
    { error: 'Too many requests. Please try again later.' },
    429,
    { 'Retry-After': String(retryAfter) }
  );
}
