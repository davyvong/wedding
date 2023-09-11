import { NextRequest, NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Global,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const response = NextResponse.redirect(ServerEnvironment.getBaseURL());
    response.cookies.delete('token');
    return response;
  } catch (error: unknown) {
    ServerError.handle(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
