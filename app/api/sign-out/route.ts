import { NextRequest, NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SignOut,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    const response = NextResponse.redirect(ServerEnvironment.getBaseURL());
    response.cookies.delete('token');
    return response;
  } catch (error: unknown) {
    ServerError.handle(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
