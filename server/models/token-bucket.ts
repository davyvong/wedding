export interface TokenBucketData {
  refilledAt: number;
  tokens: number;
}

export type TokenBucketRedisData = [number, number];

class TokenBucket {
  public refilledAt: number;
  public tokens: number;

  constructor(data: TokenBucketData) {
    this.refilledAt = data.refilledAt;
    this.tokens = data.tokens;
  }

  public static fromRedis(data: TokenBucketRedisData): TokenBucket {
    const [tokens, refilledAt] = data;
    return new TokenBucket({
      refilledAt,
      tokens,
    });
  }

  public toRedis(): TokenBucketRedisData {
    return [this.tokens, this.refilledAt];
  }

  public consume(count: number): boolean {
    if (this.tokens > 0) {
      this.tokens = Math.max(this.tokens - count, 0);
      return true;
    }
    return false;
  }

  public refill(refillRate: number, interval: number, maxTokens: number): void {
    const now = Date.now();
    const timeElapsed = now - this.refilledAt;
    if (timeElapsed > interval) {
      const tokensRefilled = Math.floor(timeElapsed / interval) * refillRate;
      this.tokens = Math.min(this.tokens + tokensRefilled, maxTokens);
      this.refilledAt = now;
    }
  }
}

export default TokenBucket;
