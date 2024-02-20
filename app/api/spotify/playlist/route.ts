import { NextRequest } from 'next/server';
import SpotifyAPI, { SpotifyPlaylistTrack } from 'server/apis/spotify';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import Token from 'server/token';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const body = await request.json();
    const bodySchema = object({
      token: string().required().min(1),
    });
    if (!bodySchema.isValidSync(body)) {
      return ServerError.BadRequest();
    }
    const isTokenVerified = await Token.verify(body.token, process.env.SPOTIFY_PLAYLIST_ID);
    console.log(`[POST] /api/spotify/playlist tokenVerified=${isTokenVerified}`);
    if (!isTokenVerified) {
      return ServerError.Unauthorized();
    }
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
    return new Response(null, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
