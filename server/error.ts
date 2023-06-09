export enum ServerErrorCode {
  InvalidRequestIP = 'InvalidRequestIP',
  UnexpectedError = 'UnexpectedError',
}

interface ServerErrorOptions {
  code: ServerErrorCode;
  status: number;
}

class ServerError {
  private status = 500;

  constructor(options: ServerErrorOptions) {
    Object.assign(this, options);
  }

  toRequest() {
    return {
      status: this.status,
    };
  }
}

export default ServerError;
