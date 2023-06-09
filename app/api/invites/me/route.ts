import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import GuestAuthenticator from 'server/authenticator';
import MongoDBClientFactory from 'server/clients/mongodb';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { MongoDBDocumentConverter } from 'server/utils/mongodb';
import Validator from 'server/validator';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.Global,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await GuestAuthenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    if (!Validator.isObjectId(token.id)) {
      return new Response(undefined, { status: 401 });
    }
    const db = await MongoDBClientFactory.getInstance();
    const aggregation = await db
      .collection('invites')
      .aggregate([
        {
          $limit: 1,
        },
        {
          $match: {
            guests: new ObjectId(token.id),
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
      return new Response(undefined, { status: 401 });
    }
    const [doc] = aggregation;
    return NextResponse.json(
      {
        ...MongoDBDocumentConverter.toInvite(doc),
        guests: doc.guests.map(MongoDBDocumentConverter.toGuest),
        responses: doc.responses.map(MongoDBDocumentConverter.toResponse),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return new Response(undefined, { status: 500 });
  }
};
