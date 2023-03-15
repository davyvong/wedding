import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseURL } from 'server/env';
import { signToken } from 'server/jwt';
import { getMongoDatabase } from 'server/mongodb';
import { applyRateLimiter } from 'server/rate-limiter';
import { createRedisKey, getRedisClient } from 'server/redis';
import { isLoginCode } from 'utils/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!isLoginCode(request.query.code)) {
      response.status(400).end();
      return;
    }
    const redisClient = await getRedisClient();
    const redisKey = createRedisKey('codes', request.query.code as string);
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      response.status(400).end();
      return;
    }
    const db = await getMongoDatabase();
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
