import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 3000,
      scope: RateLimiterScope.SpotifySearch,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const requestURL = new URL(request.url);
    const params = {
      query: requestURL.searchParams.get('query'),
    };
    const paramsSchema = object({
      query: string().required().min(1).max(256),
    });
    if (!paramsSchema.isValidSync(params)) {
      return new Response(undefined, { status: 400 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForItem(accessToken, params.query);
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=86400' },
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
