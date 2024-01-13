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
  status: number;
}

class ServerError {
  public status = 500;

  constructor(options: ServerErrorOptions) {
    Object.assign(this, options);
  }

  public static handle(error: unknown): Response {
    console.log(error);
    if (error instanceof ServerError) {
      return new Response(undefined, { status: error.status });
    }
    return new Response(undefined, { status: 500 });
  }
}

export default ServerError;
