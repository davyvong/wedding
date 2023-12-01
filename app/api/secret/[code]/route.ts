import { NextRequest, NextResponse } from 'next/server';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import JWT from 'server/jwt';
import RedisKey from 'server/models/redis-key';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import MongoDBQueryTemplate from 'server/templates/mongodb';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest, { params }: { params: { code: string } }): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Global,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const paramsSchema = object({
      code: string()
        .required()
        .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('codes', params.code);
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const guest = await MongoDBQueryTemplate.findGuestFromId(cachedGuestId);
    if (!guest) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const token = await JWT.sign({ id: cachedGuestId });
    const response = NextResponse.redirect(ServerEnvironment.getBaseURL() + '/?flyout=rsvp');
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    response.cookies.set('token', token, { expires: expiryDate });
    return response;
  } catch (error: unknown) {
    ServerError.handle(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
