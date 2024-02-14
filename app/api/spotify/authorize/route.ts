import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SpotifyAuthorize,
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
    const authorizationURL = SpotifyAPI.getAuthorizationURL();
    return NextResponse.redirect(authorizationURL);
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
