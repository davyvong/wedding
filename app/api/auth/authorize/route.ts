import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { RedisKeyBuilder } from 'server/builders/redis';
import MongoDBClientFactory from 'server/clients/mongodb';
import RedisClientFactory from 'server/clients/redis';
import ServerEnvironment from 'server/environment';
import JWT from 'server/jwt';
import Validator from 'server/validator';

export const GET = async (request: Request): Promise<Response> => {
  try {
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    if (!params.code || !Validator.isLoginCode(params.code)) {
      return new Response(undefined, { status: 400 });
    }
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = new RedisKeyBuilder().set('codes', params.code).toString();
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      return new Response(undefined, { status: 400 });
    }
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(cachedGuestId) });
    if (!doc) {
      return new Response(undefined, { status: 400 });
    }
    await redisClient.del(redisKey);
    const token = await JWT.sign({ id: cachedGuestId });
    const response = NextResponse.redirect(ServerEnvironment.getBaseURL());
    response.cookies.set('token', token);
    return response;
  } catch (error: unknown) {
    console.log(error);
    return new Response(undefined, { status: 500 });
  }
};
