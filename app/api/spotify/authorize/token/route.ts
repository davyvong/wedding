import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SpotifyAuthorizeToken,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    if (!ServerEnvironment.isDevelopment) {
      throw new ServerError({
        code: ServerErrorCode.MethodNotAllowed,
        rateLimit: checkResults,
        status: 405,
      });
    }
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    const paramsSchema = object({
      code: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const refreshToken = await SpotifyAPI.getRefreshToken(params.code);
    return NextResponse.json(
      { token: refreshToken },
      {
        headers: RateLimiter.toHeaders(checkResults),
        status: 200,
      },
    );
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
