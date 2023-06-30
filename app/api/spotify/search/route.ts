import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import RedisClientFactory from 'server/clients/redis';
import ServerError from 'server/error';
import RedisKey from 'server/models/redis-key';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Spotify,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const body = await request.json();
    const bodySchema = object({
      query: string().required().min(1).max(256),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('spotify', 'search', body.query);
    const cachedResults = await redisClient.get(redisKey);
    if (cachedResults) {
      return NextResponse.json(JSON.parse(cachedResults), { status: 200 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForItem(accessToken, body.query);
    await redisClient.set(redisKey, JSON.stringify(results));
    return NextResponse.json(results, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
