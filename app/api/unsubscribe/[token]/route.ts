import Translate from 'client/translate';
import { NextRequest } from 'next/server';
import ServerError from 'server/error';
import MySQLQueries from 'server/queries/mysql';
import UnsubscribeToken from 'server/tokens/unsubscribe';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (request: NextRequest, { params }: { params: { token: string } }): Promise<Response> => {
  try {
    const paramsSchema = object({
      token: string().required(),
    });
    const response = new Response(Translate.t('app.api.unsubscribe.success'), { status: 200 });
    if (!paramsSchema.isValidSync(params)) {
      return response;
    }
    const payload = await UnsubscribeToken.verify(params.token);
    Logger.info({ payload });
    const guest = await MySQLQueries.findGuestFromId(payload.guestId);
    Logger.info({ guest });
    if (!guest) {
      return response;
    }
    if (guest.email !== payload.guestEmail) {
      return response;
    }
    await MySQLQueries.updateGuestSubscription(guest.id, false);
    return response;
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
