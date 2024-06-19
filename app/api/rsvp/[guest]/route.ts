import { NextRequest, NextResponse } from 'next/server';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import SupabaseQueries from 'server/queries/supabase';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
  try {
    Logger.info({ params });
    const paramsSchema = object({
      guest: string().uuid().required(),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    if (params.guest !== token.guestId && !token.isAdmin) {
      if (!(await SupabaseQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]))) {
        return ServerError.Forbidden();
      }
    }
    const response = await SupabaseQueries.findRSVPFromGuestId(params.guest);
    Logger.info({ response });
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

// export const POST = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
//   try {
//     Logger.info({ params });
//     const paramsSchema = object({
//       guest: string().uuid().required(),
//     });
//     if (!paramsSchema.isValidSync(params)) {
//       return ServerError.BadRequest();
//     }
//     const body = await request.json();
//     Logger.info({ body });
//     const bodySchema = object({
//       attendance: boolean().required(),
//       dietaryRestrictions: string(),
//       entree: string<EntreeOptions>().when('attendance', {
//         is: true,
//         then: schema => schema.oneOf(Object.values(EntreeOptions)).required(),
//       }),
//       mailingAddress: string(),
//       message: string().required(),
//     });
//     if (!bodySchema.isValidSync(body)) {
//       return ServerError.BadRequest();
//     }
//     const token = await Authenticator.verifyToken(request.cookies);
//     if (!token) {
//       return ServerError.Unauthorized();
//     }
//     if (params.guest !== token.guestId && !token.isAdmin) {
//       if (!(await SupabaseQueries.findGuestGroupFromGuestIds([token.guestId, params.guest]))) {
//         return ServerError.Forbidden();
//       }
//     }
//     const response = await SupabaseQueries.upsertResponse(token, params.guest, {
//       attendance: body.attendance,
//       dietaryRestrictions: body.dietaryRestrictions,
//       entree: body.entree,
//       mailingAddress: body.mailingAddress,
//       message: body.message,
//     });
//     Logger.info({ response });
//     waitUntil(async (): Promise<void> => {
//       try {
//         await GoogleSheetsAPI.refreshGuestListSheet();
//       } catch (error: unknown) {
//         Logger.error(error);
//       }
//     });
//     if (!response) {
//       return new Response(null, { status: 204 });
//     }
//     return NextResponse.json(response, { status: 200 });
//   } catch (error: unknown) {
//     return ServerError.handleError(error);
//   }
// };
