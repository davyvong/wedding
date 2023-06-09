export class RedisKeyBuilder {
  path: string[] = [];

  filter(callback: (value: string, index: number, array: string[]) => boolean): RedisKeyBuilder {
    this.path = this.path.filter(callback);
    return this;
  }

  clear(): RedisKeyBuilder {
    this.path = [];
    return this;
  }

  pop(): RedisKeyBuilder {
    this.path.pop();
    return this;
  }

  push(...path: string[]): RedisKeyBuilder {
    this.path.push(...path);
    return this;
  }

  set(...path: string[]) {
    this.path = path;
    return this;
  }

  shift(): RedisKeyBuilder {
    this.path.shift();
    return this;
  }

  toString(): string {
    return process.env.VERCEL_ENV + ':' + this.path.join(':');
  }

  unshift(...path: string[]): RedisKeyBuilder {
    this.path.unshift(...path);
    return this;
  }
}
