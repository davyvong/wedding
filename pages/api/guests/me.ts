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
    const collection = db.collection('guests');
    const doc = await collection.findOne({ _id: new ObjectId(request.token.id) });
    if (!doc) {
      response.status(401).end();
      return;
    }
    response.status(200).json({
      email: doc.email,
      name: doc.name,
      permissions: doc.permissions,
    });
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(applyToken(handler));
