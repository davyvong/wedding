import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import pkg from 'package.json';
import RedisClientFactory from 'server/clients/redis';
import ServerError from 'server/error';

const ratelimit = new Ratelimit({
  analytics: true,
  limiter: Ratelimit.tokenBucket(20, '10 s', 200),
  prefix: [pkg.name, process.env.VERCEL_ENV].join('/'),
  redis: RedisClientFactory.getInstance(),
});

async function middleware(request: NextRequest): Promise<Response> {
  const ip = request.ip ?? '127.0.0.1';
  const { limit, remaining, reset, success } = await ratelimit.limit(ip);
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
