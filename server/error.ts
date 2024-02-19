class ServerError {
  public static BadRequest(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 400,
      statusText: 'Bad Request',
    });
  }

  public static Unauthorized(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 401,
      statusText: 'Unauthorized',
    });
  }

  public static Forbidden(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 403,
      statusText: 'Forbidden',
    });
  }

  public static NotFound(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 404,
      statusText: 'Not Found',
    });
  }

  public static MethodNotAllowed(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  public static TooManyRequests(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 429,
      statusText: 'Too Many Requests',
    });
  }

  public static InternalServerError(headers?: HeadersInit): Response {
    return new Response(null, {
      headers,
      status: 500,
      statusText: 'Internal Server Error',
    });
  }

  public static handleError(error: unknown): Response {
    console.log(`[ServerError] handleError error=${error}`);
    return ServerError.InternalServerError();
  }
}

export default ServerError;
