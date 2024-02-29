import { NextRequest } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }): Promise<Response> => {
  try {
    const paramsSchema = object({
      id: string()
        .matches(/^([a-zA-Z0-9]){22}/)
        .required(),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    await MySQLQueries.deleteSongRequest(token.guestId, params.id);
    return new Response(null, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};

export const POST = async (request: NextRequest, { params }: { params: { id: string } }): Promise<Response> => {
  try {
    const paramsSchema = object({
      id: string()
        .matches(/^([a-zA-Z0-9]){22}/)
        .required(),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const track = await SpotifyAPI.getTrack(accessToken, params.id);
    await MySQLQueries.insertSongRequest(token, token.guestId, track.id);
    return new Response(null, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
