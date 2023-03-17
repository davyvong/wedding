import { createClient } from 'redis';

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  url: process.env.REDIS_URL,
});

export const getRedisClient = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

export const createRedisKey = (...keys: string[]): string => process.env.VERCEL_ENV + ':' + keys.join(':');
