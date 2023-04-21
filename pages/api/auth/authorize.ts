import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import Environment from 'server/env';
import JWT from 'server/jwt';
import MongoDBClient from 'server/clients/mongodb';
import applyRateLimiter from 'server/middlewares/rate-limiter';
import RedisClient from 'server/clients/redis';
import Validator from 'server/validator';

interface NextApiRequestWithQuery extends NextApiRequest {
  query: {
    code: string;
  };
}

const handler = async (request: NextApiRequestWithQuery, response: NextApiResponse): Promise<void> => {
  try {
    if (!Validator.isLoginCode(request.query.code)) {
      response.status(400).end();
      return;
    }
    const redisClient = await RedisClient.getInstance();
    const redisKey = RedisClient.getKey('codes', request.query.code);
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
    const token = JWT.sign({ id: cachedGuestId });
    response.setHeader('Set-Cookie', serialize('token', token, { maxAge: 2592000, path: '/' }));
    response.redirect(Environment.getBaseURL());
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler);
