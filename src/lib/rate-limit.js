import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getEnv } from '@/lib/env';
import { hashSecret } from '@/lib/security';
import { errors } from '@/lib/errors';

let limiterCache;

function getLimiters() {
  if (limiterCache) return limiterCache;

  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Upstash Redis credentials are required for distributed rate limiting');
  }

  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  limiterCache = {
    login: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'auno:rl:login' }),
    register: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 h'), prefix: 'auno:rl:register' }),
    otpSend: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10 m'), prefix: 'auno:rl:otp-send' }),
    otpVerify: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'auno:rl:otp-verify' }),
    passwordReset: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '15 m'), prefix: 'auno:rl:password-reset' }),
    refresh: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '1 m'), prefix: 'auno:rl:refresh' }),
  };
  return limiterCache;
}

export async function checkRateLimit(name, identifier) {
  const limiter = getLimiters()[name];
  if (!limiter) throw new Error(`Unknown rate-limit policy: ${name}`);
  const result = await limiter.limit(identifier);
  return { allowed: result.success, limit: result.limit, remaining: result.remaining, reset: result.reset };
}

export function getClientIdentifier(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function hashRateLimitIdentity(value) {
  return hashSecret(String(value || 'unknown').trim().toLowerCase());
}

export async function enforceRateLimit(name, identifier) {
  try {
    const result = await checkRateLimit(name, identifier);
    if (!result.allowed) throw errors.rateLimited();
    return result;
  } catch (error) {
    if (error?.status === 429 || error?.code === 'RATE_LIMITED') {
      throw error;
    }
    console.error(`Rate limit check failed for ${name}, proceeding:`, error?.message || error);
    return { allowed: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
  }
}
