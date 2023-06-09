import { getClientIp } from 'request-ip';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import { RedisKeyBuilder } from 'server/utils/redis';
import Validator from 'server/validator';

export enum RateLimiterScope {
  Global = 'Global',
  EmailAuthentication = 'EmailAuthentication',
  Spotify = 'Spotify',
}

interface RateLimiterOptions {
  interval?: number;
  requestsPerInterval?: number;
  scope: RateLimiterScope;
}

interface RateLimiterCheckResult {
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

  public async checkRequest(request: Request): Promise<RateLimiterCheckResult> {
    if (ServerEnvironment.isDevelopment) {
      return {
        exceeded: false,
        limit: Infinity,
        remaining: Infinity,
        reset: Infinity,
      };
    }
    const ip = getClientIp(request);
    if (!Validator.isIP(ip)) {
      throw new ServerError({
        code: ServerErrorCode.InvalidRequestIP,
        status: 400,
      });
    }
    try {
      const redisClient = await RedisClientFactory.getInstance();
      const redisKey = new RedisKeyBuilder().set('rate-limit', this.scope, ip).toString();
      if (!(await redisClient.exists(redisKey))) {
        await redisClient.set(redisKey, 0, { EX: this.interval });
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
        code: ServerErrorCode.UnexpectedError,
        status: 500,
      });
    }
  }
}

export default RateLimiter;
