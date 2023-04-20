import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import { applyToken } from 'server/jwt';
import { applyRateLimiter, RateLimitScopes } from 'server/rate-limiter';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    const accessToken = await SpotifyAPI.getAccessToken();
    const playlist = await SpotifyAPI.getPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID as string);
    response.status(200).json(playlist);
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler), {
  scope: RateLimitScopes.Spotify,
});
