import { ObjectId } from 'mongodb';
import type { NextApiResponse } from 'next';
import type { NextApiRequestWithToken } from 'server/jwt';
import { applyToken } from 'server/jwt';
import Guest from 'server/models/guest';
import Invite from 'server/models/invite';
import Response from 'server/models/response';
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
      ...Invite.toJSON(doc),
      guests: doc.guests.map(Guest.toJSON),
      responses: doc.responses.map(Response.toJSON),
    });
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler));
