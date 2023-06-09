import { createClient } from 'redis';

class RedisClientFactory {
  private static readonly instance = createClient({
    url: process.env.REDIS_URL,
  });

  public static async getInstance() {
    if (!RedisClientFactory.instance.isOpen) {
      await RedisClientFactory.instance.connect();
    }
    return RedisClientFactory.instance;
  }
}

export default RedisClientFactory;
