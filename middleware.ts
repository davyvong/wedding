import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import pkg from 'package.json';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import { string } from 'yup';

const ratelimit = new Ratelimit({
  analytics: ServerEnvironment.isProduction,
  limiter: Ratelimit.tokenBucket(90, '30 s', 180),
  prefix: [pkg.name, process.env.VERCEL_ENV].join('/'),
  redis: RedisClientFactory.getInstance(),
});

export const config = {
  matcher: ['/api/:path*'],
};

async function middleware(request: NextRequest): Promise<Response> {
  if (ServerEnvironment.isDevelopment) {
    return NextResponse.next();
  }
  if (!request.ip) {
    return ServerError.BadRequest();
  }
  const ipSchema = string()
    .required()
    .min(7)
    .max(15)
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
  if (!ipSchema.isValidSync(request.ip)) {
    return ServerError.BadRequest();
  }
  const { limit, remaining, reset, success } = await ratelimit.limit(request.ip);
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
