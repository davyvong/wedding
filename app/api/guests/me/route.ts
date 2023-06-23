import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import GuestAuthenticator from 'server/authenticator';
import MongoDBClientFactory from 'server/clients/mongodb';
import ServerError from 'server/error';
import MDBGuest from 'server/models/guest';
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
    const doc = await db.collection('guests').findOne({ _id: new ObjectId(token.id) });
    if (!doc) {
      return new Response(undefined, { status: 401 });
    }
    return NextResponse.json(MDBGuest.fromDocument(doc), { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
