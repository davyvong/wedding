import { createClient } from 'redis';

class RedisClient {
  private static readonly instance = createClient({
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL,
  });

  public static async getInstance() {
    if (!RedisClient.instance.isOpen) {
      await RedisClient.instance.connect();
    }
    return RedisClient.instance;
  }

  public static getKey(...keys: string[]): string {
    return process.env.VERCEL_ENV + ':' + keys.join(':');
  }
}

export default RedisClient;
