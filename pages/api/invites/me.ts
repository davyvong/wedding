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
    const aggregation = await db
      .collection('invites')
      .aggregate([
        {
          $limit: 1,
        },
        {
          $match: {
            guests: new ObjectId(request.token.id),
          },
        },
        {
          $lookup: {
            as: 'guests',
            foreignField: '_id',
            from: 'guests',
            localField: 'guests',
          },
        },
        {
          $lookup: {
            as: 'responses',
            foreignField: 'guest',
            from: 'responses',
            localField: 'guests._id',
          },
        },
      ])
      .toArray();
    if (aggregation.length === 0) {
      response.status(401).end();
      return;
    }
    const [doc] = aggregation;
    response.status(200).json({
      ...MongoDBClient.toInvite(doc),
      guests: doc.guests.map(MongoDBClient.toGuest),
      responses: doc.responses.map(MongoDBClient.toResponse),
    });
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler));
