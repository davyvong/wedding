import { ObjectId } from 'mongodb';
import type { NextApiResponse } from 'next';
import type { NextApiRequestWithToken } from 'server/jwt';
import { applyToken } from 'server/jwt';
import { getMongoDatabase } from 'server/mongodb';
import { applyRateLimiter } from 'server/rate-limiter';
import { isObjectId } from 'utils/yup';

const handler = async (request: NextApiRequestWithToken, response: NextApiResponse): Promise<void> => {
  try {
    if (!isObjectId(request.token.id)) {
      response.status(401).end();
      return;
    }
    const db = await getMongoDatabase();
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
            pipeline: [
              {
                $limit: 1,
              },
              {
                $match: {
                  guest: new ObjectId(request.token.id),
                },
              },
            ],
          },
        },
      ])
      .toArray();
    if (aggregation.length === 0) {
      response.status(401).end();
      return;
    }
    const [invite] = aggregation;
    response.status(200).json(invite);
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler));
