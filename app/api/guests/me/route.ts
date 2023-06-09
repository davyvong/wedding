import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import GuestAuthenticator from 'server/authenticator';
import MongoDBClientFactory from 'server/clients/mongodb';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { MongoDBDocumentConverter } from 'server/utils/mongodb';

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
    return NextResponse.json(MongoDBDocumentConverter.toGuest(doc), { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof ServerError) {
      return new Response(undefined, { status: error.status });
    }
    return new Response(undefined, { status: 500 });
  }
};
