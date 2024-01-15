import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SpotifyPlaylist,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
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
    const playlist = await SpotifyAPI.getPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID);
    return NextResponse.json(playlist, {
      headers: {
        'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
        ...RateLimiter.toHeaders(checkResults),
      },
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
