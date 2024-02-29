import ObjectID from 'bson-objectid';
import { NextRequest, NextResponse } from 'next/server';
import { GuestTokenPayload } from 'server/authenticator';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RedisKey from 'server/models/redis-key';
import MySQLQueries from 'server/queries/mysql';
import JWT from 'server/tokens/jwt';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest, { params }: { params: { code: string } }): Promise<Response> => {
  try {
    console.log(`[GET] /api/secret/[code] code=${params.code}`);
    const paramsSchema = object({
      code: string()
        .required()
        .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/),
    });
    const redirectURL = new URL(ServerEnvironment.getBaseURL());
    if (!paramsSchema.isValidSync(params)) {
      return NextResponse.redirect(redirectURL);
    }
    const redisClient = RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('codes', params.code);
    const cachedGuestId = await redisClient.get<string>(redisKey);
    console.log(`[GET] /api/secret/[code] cachedGuestId=${cachedGuestId}`);
    if (!cachedGuestId) {
      return NextResponse.redirect(redirectURL);
    }
    const guest = await MySQLQueries.findGuestFromId(cachedGuestId);
    console.log(`[GET] /api/secret/[code] guestId=${guest?.id}`);
    if (!guest) {
      return NextResponse.redirect(redirectURL);
    }
    const payload: GuestTokenPayload = {
      guestId: guest.id,
      tokenId: ObjectID().toHexString(),
    };
    console.log(`[GET] /api/secret/[code] tokenId=${payload.tokenId}`);
    const expiresIn90Days = 7776000;
    const [token, isGuestTokenInserted] = await Promise.all([
      JWT.sign(payload, expiresIn90Days),
      MySQLQueries.insertGuestToken(payload.tokenId, payload.guestId),
    ]);
    if (!token || !isGuestTokenInserted) {
      return NextResponse.redirect(redirectURL);
    }
    redirectURL.searchParams.set('open', 'rsvp');
    const response = NextResponse.redirect(redirectURL);
    const expiryDate = new Date(Date.now() + expiresIn90Days * 1000);
    response.cookies.set('token', token, { expires: expiryDate });
    return response;
  } catch (error: unknown) {
    ServerError.handleError(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
