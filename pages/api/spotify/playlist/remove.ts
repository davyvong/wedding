import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import { applyRateLimiter, RateLimitScopes } from 'server/rate-limiter';
import Validator from 'server/validator';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    const uris = request.body.uris as string[];
    if (!Validator.isSpotifyURIList(uris)) {
      response.status(400).end();
      return;
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID as string;
    await SpotifyAPI.removeFromPlaylist(accessToken, playlistId, uris);
    response.status(202).end();
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler, {
  scope: RateLimitScopes.Spotify,
});
