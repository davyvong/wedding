import RateLimiter, { RateLimiterCheckResult } from 'server/rate-limiter';

export enum ServerErrorCode {
  BadRequest = 'BadRequest',
  Forbidden = 'Forbidden',
  InternalServerError = 'InternalServerError',
  MethodNotAllowed = 'MethodNotAllowed',
  NotFound = 'NotFound',
  TooManyRequests = 'TooManyRequests',
  Unauthorized = 'Unauthorized',
}

interface ServerErrorOptions {
  code: ServerErrorCode;
  rateLimit?: RateLimiterCheckResult;
  status: number;
}

class ServerError implements ServerErrorOptions {
  public code: ServerErrorCode = ServerErrorCode.InternalServerError;
  public rateLimit?: RateLimiterCheckResult;
  public status: number = 500;

  constructor(options: ServerErrorOptions) {
    this.code = options.code;
    this.rateLimit = options.rateLimit;
    this.status = options.status;
  }

  public static handle(error: unknown): Response {
    console.log(error);
    if (error instanceof ServerError) {
      const init: ResponseInit = {
        headers: RateLimiter.toHeaders(error.rateLimit),
        status: error.status,
      };
      return new Response(undefined, init);
    }
    return new Response(undefined, { status: 500 });
  }
}

export default ServerError;
