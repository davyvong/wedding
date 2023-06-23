import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import GuestAuthenticator from 'server/authenticator';
import MongoDBClientFactory from 'server/clients/mongodb';
import ServerError from 'server/error';
import MDBGuest from 'server/models/guest';
import MDBInvite from 'server/models/invite';
import MDBResponse from 'server/models/response';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';

export const dynamic = 'force-dynamic';

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
    if (!ObjectId.isValid(token.id)) {
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
            as: 'guestsLookup',
            foreignField: '_id',
            from: 'guests',
            localField: 'guests',
          },
        },
        {
          $lookup: {
            as: 'responsesLookup',
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
        guests: doc.guestsLookup.map((guestDoc: Document) => MDBGuest.fromDocument(guestDoc)),
        invite: MDBInvite.fromDocument(doc),
        responses: doc.responsesLookup.map((responseDoc: Document) => MDBResponse.fromDocument(responseDoc)),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
