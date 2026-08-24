import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getEnv } from '@/lib/env';
import { refreshCookieName } from '@/lib/auth-cookies';

// Initialize the API-edge rate limiter from Auno's validated environment.
// Limit: 60 requests per 10-second sliding window per IP. Endpoint-specific limits remain authoritative for sensitive operations.
let ratelimit;

function getMiddlewareRateLimiter() {
  if (ratelimit) return ratelimit;

  const env = getEnv();
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '10 s'),
    analytics: true,
    prefix: 'auno:rl:api',
  });

  return ratelimit;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ================= 1. RATE LIMITING FOR API ROUTES =================
  if (pathname.startsWith('/api')) {
    // Extract real client IP (compatible with Vercel Edge / Cloudflare)
    const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

    try {
      const { success, limit, reset, remaining } = await getMiddlewareRateLimiter().limit(ip);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please slow down.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    } catch (err) {
      console.error('Middleware rate limit check failed, proceeding:', err?.message || err);
      return NextResponse.next();
    }
  }

  // ================= 2. AUTHENTICATION & ROUTE GUARDS =================
  const refreshToken = request.cookies.get(refreshCookieName())?.value;

  const protectedRoutes = ['/sell', '/my-listings', '/profile', '/favorites'];
  const authRoutes = ['/login', '/register'];

  // Case A: Unauthenticated user accessing protected pages
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Case B: Authenticated user accessing /login or /register
  if (authRoutes.includes(pathname) && refreshToken) {
    // Presence of a refresh token is only a navigation guard.
    // Full session validation is performed by server-side routes.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// ================= 3. MATCHER CONFIGURATION =================
export const config = {
  matcher: [
    '/api/:path*',
    '/sell/:path*',
    '/my-listings/:path*',
    '/profile/:path*',
    '/favorites/:path*',
    '/favorites',
    '/login',
    '/register',
  ],
};