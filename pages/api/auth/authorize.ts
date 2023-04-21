import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseURL } from 'server/env';
import { signToken } from 'server/jwt';
import MongoDBClient from 'server/clients/mongodb';
import { applyRateLimiter } from 'server/rate-limiter';
import RedisClient from 'server/clients/redis';
import Validator from 'server/validator';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    const loginCode = request.query.code as string;
    if (!Validator.isLoginCode(loginCode)) {
      response.status(400).end();
      return;
    }
    const redisClient = await RedisClient.getInstance();
    const redisKey = RedisClient.getKey('codes', loginCode);
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      response.status(400).end();
      return;
    }
    const db = await MongoDBClient.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(cachedGuestId) });
    if (!doc) {
      response.status(400).end();
      return;
    }
    await redisClient.del(redisKey);
    const token = signToken({ id: cachedGuestId });
    response.setHeader('Set-Cookie', serialize('token', token, { maxAge: 2592000, path: '/' }));
    response.redirect(getBaseURL());
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler);
