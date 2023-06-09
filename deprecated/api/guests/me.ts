import { ObjectId } from 'mongodb';
import type { NextApiResponse } from 'next';
import applyToken from 'server/middlewares/jwt';
import type { NextApiRequestWithToken } from 'server/middlewares/jwt';
import MongoDBClient from 'server/clients/mongodb';
import applyRateLimiter from 'server/middlewares/rate-limiter';
import Validator from 'server/validator';

const handler = async (request: NextApiRequestWithToken, response: NextApiResponse): Promise<void> => {
  try {
    if (!Validator.isObjectId(request.token.id)) {
      response.status(401).end();
      return;
    }
    const db = await MongoDBClient.getInstance();
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(request.token.id) });
    if (!doc) {
      response.status(401).end();
      return;
    }
    response.status(200).json(MongoDBClient.toGuest(doc));
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler));
