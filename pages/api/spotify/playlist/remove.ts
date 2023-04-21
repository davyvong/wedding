import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import applyRateLimiter, { RateLimitScopes } from 'server/middlewares/rate-limiter';
import Validator from 'server/validator';

interface NextApiRequestWithBody extends NextApiRequest {
  body: {
    uris: string[];
  };
}

const handler = async (request: NextApiRequestWithBody, response: NextApiResponse): Promise<void> => {
  try {
    if (!Validator.isSpotifyURIList(request.body.uris)) {
      response.status(400).end();
      return;
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    await SpotifyAPI.removeFromPlaylist(accessToken, process.env.SPOTIFY_PLAYLIST_ID, request.body.uris);
    response.status(202).end();
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler, {
  scope: RateLimitScopes.Spotify,
});
