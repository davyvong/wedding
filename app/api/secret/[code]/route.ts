import ObjectID from 'bson-objectid';
import { NextRequest, NextResponse } from 'next/server';
import { GuestTokenPayload } from 'server/authenticator';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import JWT from 'server/jwt';
import RedisKey from 'server/models/redis-key';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest, { params }: { params: { code: string } }): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.SecretCode,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    console.log(`[GET] /api/secret/[code] code=${params.code}`);
    const paramsSchema = object({
      code: string()
        .required()
        .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const redisClient = RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('codes', params.code);
    const cachedGuestId = await redisClient.get<string>(redisKey);
    console.log(`[GET] /api/secret/[code] cachedGuestId=${cachedGuestId}`);
    if (!cachedGuestId) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const guest = await MySQLQueries.findGuestFromId(cachedGuestId);
    console.log(`[GET] /api/secret/[code] guestId=${guest?.id}`);
    if (!guest) {
      return NextResponse.redirect(ServerEnvironment.getBaseURL());
    }
    const payload: GuestTokenPayload = {
      guestId: guest.id,
      tokenId: ObjectID().toHexString(),
    };
    console.log(`[GET] /api/secret/[code] tokenId=${payload.tokenId}`);
    const [token, isGuestTokenInserted] = await Promise.all([
      JWT.sign(payload),
      MySQLQueries.insertGuestToken(payload.tokenId, payload.guestId),
    ]);
    if (!token || !isGuestTokenInserted) {
      throw new ServerError({
        code: ServerErrorCode.InternalServerError,
        rateLimit: checkResults,
        status: 500,
      });
    }
    const url = new URL(ServerEnvironment.getBaseURL());
    url.searchParams.set('open', 'rsvp');
    const response = NextResponse.redirect(url.href);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    response.cookies.set('token', token, { expires: expiryDate });
    return response;
  } catch (error: unknown) {
    ServerError.handle(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
