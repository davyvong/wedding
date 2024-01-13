import { NextRequest } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { array, object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SpotifyPlaylist,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        status: 429,
      });
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
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        status: 400,
      });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      throw new ServerError({
        code: ServerErrorCode.Unauthorized,
        status: 401,
      });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    await SpotifyAPI.addToPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, body.uris);
    return new Response(undefined, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
