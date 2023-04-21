import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import applyToken from 'server/middlewares/jwt';
import applyRateLimiter, { RateLimitScopes } from 'server/middlewares/rate-limiter';
import RedisClient from 'server/clients/redis';
import Validator from 'server/validator';

interface NextApiRequestWithBody extends NextApiRequest {
  body: {
    query: string;
  };
}

const handler = async (request: NextApiRequestWithBody, response: NextApiResponse): Promise<void> => {
  try {
    if (!Validator.isSpotifySearchQuery(request.body.query)) {
      response.status(400).end();
      return;
    }
    const redisClient = await RedisClient.getInstance();
    const redisKey = RedisClient.getKey('spotify', 'search', request.body.query);
    const cachedResults = await redisClient.get(redisKey);
    if (cachedResults) {
      response.status(200).json(JSON.parse(cachedResults));
      return;
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForItem(accessToken, request.body.query);
    redisClient.set(redisKey, JSON.stringify(results));
    response.status(200).json(results);
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler), {
  scope: RateLimitScopes.Spotify,
});
