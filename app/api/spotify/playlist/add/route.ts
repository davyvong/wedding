import { NextRequest } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import GuestAuthenticator from 'server/authenticator';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { array, object, string } from 'yup';

export const POST = async (request: NextRequest): Promise<Response> => {
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
    const body = await request.json();
    const bodySchema = object({
      uris: array()
        .of(
          string()
            .required()
            .matches(/^spotify:track:([a-zA-Z0-9]){22}/),
        )
        .required()
        .min(1),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    await SpotifyAPI.addToPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, body.uris);
    return new Response(undefined, { status: 202 });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof ServerError) {
      return new Response(undefined, { status: error.status });
    }
    return new Response(undefined, { status: 500 });
  }
};
