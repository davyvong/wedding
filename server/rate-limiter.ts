import RedisClientFactory from 'server/clients/redis';
import RedisKey from 'server/models/redis-key';
import TokenBucket, { TokenBucketRedisData } from 'server/models/token-bucket';

export interface RateLimiterOptions {
  interval: number;
  maxTokens: number;
  refillRate: number;
}

export interface RateLimiterResult {
  limit: number;
  remaining: number;
  reset: number;
  success: boolean;
}

class RateLimiter {
  private interval: number;
  private maxTokens: number;
  private refillRate: number;

  constructor(options: RateLimiterOptions) {
    this.interval = options.interval;
    this.maxTokens = options.maxTokens;
    this.refillRate = options.refillRate;
  }

  public async limit(ip: string): Promise<RateLimiterResult> {
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('rate-limit', ip);
    const cachedTokenBucket = await redisClient.get<TokenBucketRedisData>(redisKey);
    let tokenBucket;
    if (cachedTokenBucket) {
      tokenBucket = TokenBucket.fromRedis(cachedTokenBucket);
      tokenBucket.refill(this.refillRate, this.interval, this.maxTokens);
    } else {
      tokenBucket = new TokenBucket({
        refilledAt: Date.now(),
        tokens: this.maxTokens,
      });
    }
    const success = tokenBucket.consume(1);
    await redisClient.set<TokenBucketRedisData>(redisKey, tokenBucket.toRedis(), {
      px: (this.maxTokens / this.refillRate) * this.interval,
    });
    return {
      limit: this.maxTokens,
      remaining: tokenBucket.tokens,
      reset: tokenBucket.refilledAt + this.interval,
      success,
    };
  }
}

export default RateLimiter;
