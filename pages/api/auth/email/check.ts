import serverErrors from 'constants/server-errors.json';
import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseURL } from 'utils/env';
import { signToken } from 'utils/jwt';
import { getMongoDatabase } from 'utils/mongodb';
import { createRedisKey, getRedisClient } from 'utils/redis';
import { isLoginCode } from 'utils/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!isLoginCode(request.query.code)) {
      throw new Error(serverErrors.invalidLoginCode);
    }
    const redisClient = await getRedisClient();
    const redisKey = createRedisKey('codes', request.query.code as string);
    const cachedGuestId = await redisClient.get(redisKey);
    if (!cachedGuestId) {
      throw new Error(serverErrors.loginCodeNotFound);
    }
    const db = await getMongoDatabase();
    const collection = db.collection('guests');
    const doc = await collection.findOne({ _id: new ObjectId(cachedGuestId) });
    if (!doc) {
      throw new Error(serverErrors.guestNotFound);
    }
    await redisClient.del(redisKey);
    const token = signToken({ id: cachedGuestId });
    response.setHeader('Set-Cookie', serialize('token', token, { maxAge: 2592000, path: '/' }));
    response.redirect(getBaseURL());
  } catch (error) {
    console.error(error.message);
  } finally {
    response.status(202).end();
  }
};

export default handler;
