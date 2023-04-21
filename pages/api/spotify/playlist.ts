import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import applyToken from 'server/middlewares/jwt';
import applyRateLimiter, { RateLimitScopes } from 'server/middlewares/rate-limiter';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    const accessToken = await SpotifyAPI.getAccessToken();
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID as string;
    const playlist = await SpotifyAPI.getPlaylist(accessToken, playlistId);
    response.status(200).json(playlist);
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler), {
  scope: RateLimitScopes.Spotify,
});
