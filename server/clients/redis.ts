import { Redis } from '@upstash/redis';

class RedisClientFactory {
  private static instance = new Redis({
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    url: process.env.UPSTASH_REDIS_REST_URL,
  });

  public static getInstance(): Redis {
    return RedisClientFactory.instance;
  }
}

export default RedisClientFactory;
