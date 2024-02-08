import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI, { SpotifyTrack } from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Songs,
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
    const songRequests = await MySQLQueries.findSongRequestsFromGuestId(token.guestId);
    if (!songRequests) {
      throw new ServerError({
        code: ServerErrorCode.InternalServerError,
        rateLimit: checkResults,
        status: 500,
      });
    }
    if (songRequests.length === 0) {
      return NextResponse.json([], {
        headers: RateLimiter.toHeaders(checkResults),
        status: 200,
      });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const chunkedRequests: Promise<SpotifyTrack[]>[] = [];
    for (let i = 0; i < songRequests.length; i += 50) {
      const chunkedSongRequests = songRequests.slice(i, i + 50);
      chunkedRequests.push(SpotifyAPI.getSeveralTracks(accessToken, chunkedSongRequests));
    }
    const tracks = (await Promise.all(chunkedRequests)).flat();
    return NextResponse.json(tracks, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
