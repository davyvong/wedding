import pkg from 'package.json';

class RedisKey {
  public static create(...paths: string[]): string {
    return [pkg.name, process.env.VERCEL_ENV, ...paths].join(':');
  }
}

export default RedisKey;
