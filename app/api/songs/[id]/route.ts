import { internal_runWithWaitUntil as waitUntil } from 'next/dist/server/web/internal-edge-wait-until';
import { NextRequest } from 'next/server';
import SpotifyAPI, { SpotifyPlaylistTrack } from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const rebuildWeddingPlaylist = async (): Promise<void> => {
  const accessToken = await SpotifyAPI.getAccessToken();
  const playlist = await SpotifyAPI.getPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID);
  const uris = playlist.tracks.map((track: SpotifyPlaylistTrack): string => track.uri);
  const chunkedRequests: Promise<void>[] = [];
  for (let i = 0; i < uris.length; i += 100) {
    const urisChunk = uris.slice(i, i + 100);
    chunkedRequests.push(SpotifyAPI.removeFromPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, urisChunk));
  }
  await Promise.all(chunkedRequests);
  chunkedRequests.length = 0;
  const songRequests = await MySQLQueries.findSongRequests();
  if (songRequests) {
    for (let i = 0; i < songRequests.length; i += 100) {
      const songRequestsChunk = songRequests
        .slice(i, i + 100)
        .map((trackId: string): string => 'spotify:track:' + trackId);
      chunkedRequests.push(SpotifyAPI.addToPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, songRequestsChunk));
    }
  }
  await Promise.all(chunkedRequests);
};

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
    waitUntil(rebuildWeddingPlaylist);
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
    waitUntil(rebuildWeddingPlaylist);
    return new Response(null, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
