import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from 'server/jwt';
import { getMongoDatabase } from 'server/mongodb';
import { applyRateLimiter } from 'server/rate-limiter';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!request.cookies.token) {
      response.status(401).end();
      return;
    }
    const token = await verifyToken(request.cookies.token);
    if (!token) {
      response.status(401).end();
      return;
    }
    const db = await getMongoDatabase();
    const collection = db.collection('guests');
    const doc = await collection.findOne({ _id: new ObjectId(token.id) });
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

export default applyRateLimiter(handler);
