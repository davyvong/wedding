import { NextRequest } from 'next/server';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import RedisKey from 'server/models/redis-key';
import { string } from 'yup';

import RedisClientFactory from './clients/redis';

export enum RateLimiterScope {
  AddressSearch = 'AddressSearch',
  RSVP = 'RSVP',
  SecretCode = 'SecretCode',
  SecretEmail = 'SecretEmail',
  SignOut = 'SignOut',
  SpotifyAuthorize = 'SpotifyAuthorize',
  SpotifyAuthorizeToken = 'SpotifyAuthorizeToken',
  SpotifyPlaylist = 'SpotifyPlaylist',
  SpotifyPlaylistDedupe = 'SpotifyPlaylistDedupe',
  SpotifySearch = 'SpotifySearch',
}

interface RateLimiterOptions {
  interval?: number;
  requestsPerInterval?: number;
  scope: RateLimiterScope;
}

export interface RateLimiterCheckResult {
  exceeded: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiter {
  private interval = 3600;
  private requestsPerInterval = 1000;
  private scope: RateLimiterScope;

  constructor(options: RateLimiterOptions) {
    Object.assign(this, options);
  }

  public static toHeaders(checkResults?: RateLimiterCheckResult): Record<string, string> {
    if (!checkResults) {
      return {};
    }
    return {
      'X-RateLimit-Limit': checkResults.limit.toString(),
      'X-RateLimit-Remaining': checkResults.remaining.toString(),
      'X-RateLimit-Reset': checkResults.reset.toString(),
    };
  }

  public async checkRequest(request: NextRequest): Promise<RateLimiterCheckResult> {
    if (ServerEnvironment.isDevelopment) {
      return {
        exceeded: false,
        limit: Infinity,
        remaining: Infinity,
        reset: Infinity,
      };
    }
    const ip = request.headers.get('x-vercel-proxied-for');
    const ipSchema = string()
      .required()
      .min(7)
      .max(15)
      .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
    if (!ipSchema.isValidSync(ip)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        status: 400,
      });
    }
    try {
      const redisClient = RedisClientFactory.getInstance();
      const redisKey = RedisKey.create('rate-limit', this.scope.valueOf().toLowerCase(), ip);
      if (!(await redisClient.exists(redisKey))) {
        await redisClient.set(redisKey, 0, { ex: this.interval });
      }
      const requestCount = await redisClient.incr(redisKey);
      return {
        exceeded: requestCount > this.requestsPerInterval,
        limit: this.requestsPerInterval,
        remaining: Math.max(0, this.requestsPerInterval - requestCount),
        reset: await redisClient.ttl(redisKey),
      };
    } catch (error: unknown) {
      console.log(error);
      throw new ServerError({
        code: ServerErrorCode.InternalServerError,
        status: 500,
      });
    }
  }
}

export default RateLimiter;
