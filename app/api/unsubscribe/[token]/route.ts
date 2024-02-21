import Translate from 'client/translate';
import { NextRequest } from 'next/server';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import UnsubscribeToken from 'server/tokens/unsubscribe';
import { object, string } from 'yup';

export const GET = async (request: NextRequest, { params }: { params: { token: string } }): Promise<Response> => {
  try {
    console.log(`[GET] /api/unsubscribe/[token] token=${params.token}`);
    const paramsSchema = object({
      token: string().required(),
    });
    const response = new Response(Translate.t('app.api.unsubscribe.success'), { status: 200 });
    if (!paramsSchema.isValidSync(params)) {
      return response;
    }
    const payload = await UnsubscribeToken.verify(params.token);
    console.log(`[GET] /api/unsubscribe/[token] tokenGuestEmail=${payload.guestEmail} tokenGuestId=${payload.guestId}`);
    const guest = await MySQLQueries.findGuestFromId(payload.guestId);
    console.log(`[GET] /api/unsubscribe/[token] guestEmail=${guest?.email} guestId=${guest?.id}`);
    if (!guest) {
      return response;
    }
    if (guest.email !== payload.email) {
      return response;
    }
    return response;
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
