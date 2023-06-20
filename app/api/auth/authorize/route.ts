import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import MongoDBClientFactory from 'server/clients/mongodb';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import JWT from 'server/jwt';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { RedisKeyBuilder } from 'server/utils/redis';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Global,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    const paramsSchema = object({
      code: string()
        .required()
        .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = new RedisKeyBuilder().set('codes', params.code).toString();
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(cachedGuestId) });
    if (!doc) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const token = await JWT.sign({ id: cachedGuestId });
    const response = NextResponse.redirect(ServerEnvironment.getBaseURL() + '/rsvp');
    response.cookies.set('token', token);
    return response;
  } catch (error: unknown) {
    ServerError.handle(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
