import { EntreeOptions } from 'components/flyouts/rsvp/constants';
import { NextRequest, NextResponse } from 'next/server';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { boolean, mixed, object, string } from 'yup';

export const GET = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
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
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return new Response(undefined, { status: 400 });
    }
    if (token.id !== params.guest) {
      const adminGuestIds = new Set<string>(process.env.SUPER_ADMINS.split(','));
      if (!adminGuestIds.has(token.id)) {
        return new Response(undefined, { status: 403 });
      }
    }
    const response = await MySQLQueries.findRSVPFromGuestId(params.guest);
    if (!response) {
      return new Response(undefined, { status: 404 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};

export const POST = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
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
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return new Response(undefined, { status: 400 });
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
    if (params.guest !== token.id) {
      const adminGuestIds = new Set<string>(process.env.SUPER_ADMINS.split(','));
      if (!adminGuestIds.has(token.id)) {
        const guestGroup = await MySQLQueries.findGuestGroupFromGuestIds([token.id, params.guest]);
        if (!guestGroup) {
          return new Response(undefined, { status: 403 });
        }
      }
    }
    const response = await MySQLQueries.findAndUpdateResponse(params.guest, {
      attendance: body.attendance,
      dietaryRestrictions: body.dietaryRestrictions,
      entree: body.entree,
      mailingAddress: body.mailingAddress,
      message: body.message,
    });
    if (!response) {
      return new Response(undefined, { status: 204 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
