import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI, { SpotifyTrack } from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
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
    const redisKey = RedisKey.create('spotify', 'search', body.query);
    const cachedResults = await kv.get<SpotifyTrack[]>(redisKey);
    if (cachedResults) {
      return NextResponse.json(cachedResults, { status: 200 });
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForItem(accessToken, body.query);
    await kv.set(redisKey, results);
    return NextResponse.json(results, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
