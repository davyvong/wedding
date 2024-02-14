import { NextRequest } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }): Promise<Response> => {
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
    console.log(`[DELETE] /api/songs/[id] spotifyTrackId=${params.id}`);
    const paramsSchema = object({
      id: string()
        .matches(/^([a-zA-Z0-9]){22}/)
        .required(),
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
    await MySQLQueries.deleteSongRequest(token.guestId, params.id);
    return new Response(undefined, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 202,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};

export const POST = async (request: NextRequest, { params }: { params: { id: string } }): Promise<Response> => {
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
    console.log(`[POST] /api/songs/[id] spotifyTrackId=${params.id}`);
    const paramsSchema = object({
      id: string()
        .matches(/^([a-zA-Z0-9]){22}/)
        .required(),
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
    const track = await SpotifyAPI.getTrack(accessToken, params.id);
    await MySQLQueries.insertSongRequest(token, token.guestId, track.id);
    return new Response(undefined, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 202,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
