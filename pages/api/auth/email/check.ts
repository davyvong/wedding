import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseURL } from 'utils/env';
import { signToken } from 'utils/jwt';
import { getMongoDatabase } from 'utils/mongodb';
import { applyRateLimiter } from 'utils/rate-limiter';
import { createRedisKey, getRedisClient } from 'utils/redis';
import { isLoginCode } from 'utils/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
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
  const collection = db.collection('guests');
  const doc = await collection.findOne({ _id: new ObjectId(cachedGuestId) });
  if (!doc) {
    response.status(400).end();
    return;
  }
  await redisClient.del(redisKey);
  const token = signToken({ id: cachedGuestId });
  response.setHeader('Set-Cookie', serialize('token', token, { maxAge: 2592000, path: '/' }));
  response.redirect(getBaseURL());
};

export default applyRateLimiter(handler);
