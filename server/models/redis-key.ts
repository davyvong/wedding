class RedisKey {
  public static create(...paths: string[]): string {
    return process.env.VERCEL_ENV + ':' + paths.join(':');
  }
}

export default RedisKey;
