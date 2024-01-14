import { NextRequest } from 'next/server';
import SpotifyAPI, { SpotifyPlaylistTrack } from 'server/apis/spotify';
import ServerError, { ServerErrorCode } from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import Token from 'server/token';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 5,
      scope: RateLimiterScope.SpotifyPlaylistDedupe,
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
      token: requestURL.searchParams.get('token'),
    };
    const paramsSchema = object({
      token: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    if (!(await Token.verify(params.token, process.env.SPOTIFY_PLAYLIST_ID))) {
      throw new ServerError({
        code: ServerErrorCode.Unauthorized,
        rateLimit: checkResults,
        status: 401,
      });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const tracks = await SpotifyAPI.getDuplicateTracksInPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID);
    const uris = tracks.map((track: SpotifyPlaylistTrack): string => track.uri);
    await SpotifyAPI.removeFromPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, uris);
    await SpotifyAPI.addToPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, uris);
    return new Response(undefined, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 202,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
