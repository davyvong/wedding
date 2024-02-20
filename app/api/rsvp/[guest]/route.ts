import { EntreeOptions } from 'components/flyouts/rsvp/constants';
import { NextRequest, NextResponse } from 'next/server';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import { boolean, object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
  try {
    console.log(`[GET] /api/rsvp/[guest] guestId=${params.guest}`);
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    console.log(`[GET] /api/rsvp/[guest] guestId=${params.guest} tokenGuestId=${token.guestId}`);
    if (params.guest !== token.guestId && !token.isAdmin) {
      const guestGroup = await MySQLQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]);
      console.log(`[GET] /api/rsvp/[guest] isGuestGroupMember=${guestGroup}`);
      if (!guestGroup) {
        return ServerError.Forbidden();
      }
    }
    const response = await MySQLQueries.findRSVPFromGuestId(params.guest);
    console.log(`[GET] /api/rsvp/[guest] rsvpFound=${Boolean(response)}`);
    if (!response) {
      return ServerError.NotFound();
    }
    return NextResponse.json(
      {
        guests: response.guests.map(guest => guest.valueOf()),
        responses: response.responses.map(response => response.valueOf()),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};

export const POST = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
  try {
    const paramsSchema = object({
      guest: string()
        .required()
        .matches(/^[0-9a-fA-F]{24}$/),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    console.log(`[POST] /api/rsvp/[guest] guestId=${params.guest}`);
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
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    console.log(`[POST] /api/rsvp/[guest] guestId=${params.guest} tokenGuestId=${token.guestId}`);
    if (params.guest !== token.guestId && !token.isAdmin) {
      const guestGroup = await MySQLQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]);
      console.log(`[POST] /api/rsvp/[guest] isGuestGroupMember=${guestGroup}`);
      if (!guestGroup) {
        return ServerError.Forbidden();
      }
    }
    const response = await MySQLQueries.upsertResponse(token, params.guest, {
      attendance: body.attendance,
      dietaryRestrictions: body.dietaryRestrictions,
      entree: body.entree,
      mailingAddress: body.mailingAddress,
      message: body.message,
    });
    console.log(`[POST] /api/rsvp/[guest] responseId=${response?.id}`);
    if (!response) {
      return new Response(null, { status: 204 });
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
