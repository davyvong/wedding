import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import { createRedisKey, getRedisClient } from 'server/redis';
import { isIP } from 'server/yup';

interface RateLimitOptions {
  interval: number;
  requestsPerInterval: number;
  scope: string;
}

interface RateLimitInitOptions {
  interval?: number;
  requestsPerInterval?: number;
  scope: string;
}

const defaultOptions: RateLimitOptions = {
  interval: 3600,
  requestsPerInterval: 1000,
  scope: 'api',
};

export const applyRateLimiter =
  (next: (request: NextApiRequest, response: NextApiResponse) => unknown, initOptions?: RateLimitInitOptions) =>
  async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
    try {
      if (process.env.VERCEL_ENV === 'development') {
        await next(request, response);
        return;
      }
      const ip = getClientIp(request);
      if (!isIP(ip)) {
        response.status(400).end();
        return;
      }
      const options = Object.assign({}, defaultOptions, initOptions);
      const redisClient = await getRedisClient();
      const redisKey = createRedisKey('rate-limit', options.scope, ip);
      if (!(await redisClient.exists(redisKey))) {
        await redisClient.set(redisKey, 0, { EX: options.interval });
      }
      const requestCount = await redisClient.incr(redisKey);
      response.setHeader('X-RateLimit-Limit', options.requestsPerInterval);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, options.requestsPerInterval - requestCount));
      response.setHeader('X-RateLimit-Reset', await redisClient.ttl(redisKey));
      if (requestCount > options.requestsPerInterval) {
        response.status(429).end();
        return;
      }
      await next(request, response);
    } catch (error) {
      console.log(error);
      await next(request, response);
    }
  };
