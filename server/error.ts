import ServerEnvironment from './environment';

export enum ServerErrorCode {
  InvalidRequestIP = 'InvalidRequestIP',
  UnexpectedError = 'UnexpectedError',
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

  public toRequest() {
    return {
      status: this.status,
    };
  }

  public static async to404Page(): Promise<Response> {
    const response = await fetch(ServerEnvironment.getBaseURL() + '/404');
    const responseText = await response.text();
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      status: 404,
    });
  }

  public static handle(error: unknown) {
    console.log(error);
    if (error instanceof ServerError) {
      return new Response(undefined, { status: error.status });
    }
    return new Response(undefined, { status: 500 });
  }
}

export default ServerError;
