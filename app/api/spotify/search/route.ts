import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 3000,
      scope: RateLimiterScope.SpotifySearch,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    const requestURL = new URL(request.url);
    const params = {
      query: requestURL.searchParams.get('query'),
    };
    console.log(`[GET] /api/spotify/search query=${params.query}`);
    const paramsSchema = object({
      query: string().required().min(1).max(256),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      throw new ServerError({
        code: ServerErrorCode.Unauthorized,
        rateLimit: checkResults,
        status: 401,
      });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForTrack(accessToken, params.query);
    console.log(`[GET] /api/spotify/search resultsFound=${results.length}`);
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 's-maxage=604800, stale-while-revalidate=86400',
        ...RateLimiter.toHeaders(checkResults),
      },
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
