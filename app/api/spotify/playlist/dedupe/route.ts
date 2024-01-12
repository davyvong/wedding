import { NextRequest } from 'next/server';
import SpotifyAPI, { SpotifyPlaylistTrack } from 'server/apis/spotify';
import ServerError from 'server/error';
import Token from 'server/token';
import { object, string } from 'yup';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const requestURL = new URL(request.url);
    const params = {
      token: requestURL.searchParams.get('token'),
    };
    const paramsSchema = object({
      token: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.to404Page();
    }
    if (!(await Token.verify(params.token, process.env.SPOTIFY_PLAYLIST_ID))) {
      return ServerError.to404Page();
    }
  } catch (error: unknown) {
    return ServerError.to404Page();
  }
  try {
    const accessToken = await SpotifyAPI.getAccessToken();
    const tracks = await SpotifyAPI.getDuplicateTracksInPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID);
    const uris = tracks.map((track: SpotifyPlaylistTrack): string => track.uri);
    await SpotifyAPI.removeFromPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, uris);
    await SpotifyAPI.addToPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, uris);
    return new Response(undefined, {
      headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600' },
      status: 202,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
