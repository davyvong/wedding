import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import GuestAuthenticator from 'server/authenticator';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Spotify,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await GuestAuthenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const playlist = await SpotifyAPI.getPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID);
    return NextResponse.json(playlist, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof ServerError) {
      return new Response(undefined, { status: error.status });
    }
    return new Response(undefined, { status: 500 });
  }
};
