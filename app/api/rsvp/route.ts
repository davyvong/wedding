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
    const requestURL = new URL(request.url);
    const params = {
      spoofAs: requestURL.searchParams.get('spoofAs'),
    };
    const paramsSchema = object({
      spoofAs: string()
        .nullable()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return new Response(undefined, { status: 400 });
    }
    if (params.spoofAs) {
      const adminGuestIds = new Set<string>(process.env.SUPER_ADMINS.split(','));
      if (adminGuestIds.has(token.id)) {
        token.id = params.spoofAs;
      }
    }
    const response = await MongoDBQueryTemplate.findRSVPFromGuestId(token.id);
    if (!response) {
      return new Response(undefined, { status: 403 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};

export const PUT = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
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
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
      mailingAddress: string(),
      message: string().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    const adminGuestIds = new Set<string>(process.env.SUPER_ADMINS.split(','));
    if (body.guest !== token.id && !adminGuestIds.has(token.id)) {
      const guestGroup = await MongoDBQueryTemplate.findGuestGroupFromGuestIds([token.id, body.guest]);
      if (!guestGroup) {
        return new Response(undefined, { status: 403 });
      }
    }
    const response = await MongoDBQueryTemplate.findAndUpdateResponse(body.guest, {
      attendance: body.attendance,
      dietaryRestrictions: body.dietaryRestrictions,
      entree: body.entree,
      mailingAddress: body.mailingAddress,
      message: body.message,
    });
    if (!response) {
      return new Response(undefined, { status: 403 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
