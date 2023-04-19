import type { NextApiRequest, NextApiResponse } from 'next';
import SpotifyAPI from 'server/apis/spotify';
import { applyToken } from 'server/jwt';
import { applyRateLimiter } from 'server/rate-limiter';
import { createRedisKey, getRedisClient } from 'server/redis';
import { isSpotifySearchQuery } from 'server/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    const query = request.body.query as string;
    if (!isSpotifySearchQuery(query)) {
      response.status(400).end();
      return;
    }
    const redisClient = await getRedisClient();
    const redisKey = createRedisKey('spotify', 'search', query);
    const cachedResults = await redisClient.get(redisKey);
    if (cachedResults) {
      response.status(200).json(JSON.parse(cachedResults));
      return;
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForItem(accessToken, query);
    redisClient.set(redisKey, JSON.stringify(results));
    response.status(200).json(results);
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler), {
  scope: 'api-songs-search',
});
