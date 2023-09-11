import { EntreeOptions } from 'components/flyouts/rsvp/constants';
import { NextRequest, NextResponse } from 'next/server';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import MongoDBQueryTemplate from 'server/templates/mongodb';
import { boolean, mixed, object, string } from 'yup';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 1000,
      scope: RateLimiterScope.RSVP,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const response = await MongoDBQueryTemplate.findRSVPFromGuestId(token.id);
    if (!response) {
      return new Response(undefined, { status: 401 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};

export const PUT = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 1000,
      scope: RateLimiterScope.RSVP,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const body = await request.json();
    const bodySchema = object({
      attendance: boolean().required(),
      dietaryRestrictions: string(),
      entree: mixed<EntreeOptions>().oneOf(Object.values(EntreeOptions)).required(),
      mailingAddress: string(),
      message: string().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    const response = await MongoDBQueryTemplate.findAndUpdateResponse(token.id, body);
    if (!response) {
      return new Response(undefined, { status: 401 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
