import { NextRequest, NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RateLimiter from 'server/rate-limiter';
import { string } from 'yup';

export const config = {
  matcher: ['/', '/api/:path*', '/guests'],
};

async function middleware(request: NextRequest): Promise<Response> {
  if (ServerEnvironment.isDevelopment) {
    return NextResponse.next();
  }
  if (!request.ip) {
    return ServerError.InternalServerError();
  }
  const ipSchema = string()
    .required()
    .min(7)
    .max(15)
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
  if (!ipSchema.isValidSync(request.ip)) {
    return ServerError.BadRequest();
  }
  const rateLimiter = new RateLimiter({
    interval: 30000,
    maxTokens: 180,
    refillRate: 90,
  });
  const { limit, remaining, reset, success } = await rateLimiter.limit(request.ip);
  const headers: HeadersInit = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
  if (!success) {
    return ServerError.TooManyRequests(headers);
  }
  return NextResponse.next({ headers });
}

export default middleware;
