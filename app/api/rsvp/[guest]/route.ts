import { EntreeOptions } from 'components/flyouts/rsvp/constants';
import { NextRequest, NextResponse } from 'next/server';
import Authenticator from 'server/authenticator';
import ServerError, { ServerErrorCode } from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { boolean, object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      scope: RateLimiterScope.RSVP,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      throw new ServerError({
        code: ServerErrorCode.Unauthorized,
        rateLimit: checkResults,
        status: 401,
      });
    }
    if (token.guestId !== params.guest && !token.isAdmin) {
      const guestGroup = await MySQLQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]);
      if (!guestGroup) {
        throw new ServerError({
          code: ServerErrorCode.Forbidden,
          rateLimit: checkResults,
          status: 403,
        });
      }
    }
    const response = await MySQLQueries.findRSVPFromGuestId(params.guest);
    if (!response) {
      throw new ServerError({
        code: ServerErrorCode.NotFound,
        rateLimit: checkResults,
        status: 404,
      });
    }
    return NextResponse.json(
      {
        guests: response.guests.map(guest => guest.valueOf()),
        responses: response.responses.map(response => response.valueOf()),
      },
      {
        headers: RateLimiter.toHeaders(checkResults),
        status: 200,
      },
    );
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
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const body = await request.json();
    const bodySchema = object({
      attendance: boolean().required(),
      dietaryRestrictions: string(),
      entree: string<EntreeOptions>().when('attendance', {
        is: true,
        then: schema => schema.oneOf(Object.values(EntreeOptions)).required(),
      }),
      mailingAddress: string(),
      message: string().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      throw new ServerError({
        code: ServerErrorCode.Unauthorized,
        rateLimit: checkResults,
        status: 401,
      });
    }
    if (params.guest !== token.guestId && !token.isAdmin) {
      const guestGroup = await MySQLQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]);
      if (!guestGroup) {
        throw new ServerError({
          code: ServerErrorCode.Forbidden,
          rateLimit: checkResults,
          status: 403,
        });
      }
    }
    const response = await MySQLQueries.upsertResponse(token, params.guest, {
      attendance: body.attendance,
      dietaryRestrictions: body.dietaryRestrictions,
      entree: body.entree,
      mailingAddress: body.mailingAddress,
      message: body.message,
    });
    if (!response) {
      return new Response(undefined, {
        headers: RateLimiter.toHeaders(checkResults),
        status: 204,
      });
    }
    return NextResponse.json(response, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
