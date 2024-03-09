import Translate from 'client/translate';
import { internal_runWithWaitUntil as waitUntil } from 'next/dist/server/web/internal-edge-wait-until';
import { NextRequest } from 'next/server';
import ServerError from 'server/error';
import SupabaseQueries from 'server/queries/supabase';
import UnsubscribeToken from 'server/tokens/unsubscribe';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (request: NextRequest, { params }: { params: { guest: string } }): Promise<Response> => {
  try {
    Logger.info({ params });
    const paramsSchema = object({
      guest: string().uuid().required(),
    });
    const response = new Response(Translate.t('app.api.unsubscribe.success'), { status: 200 });
    if (!paramsSchema.isValidSync(params)) {
      return response;
    }
    const requestURL = new URL(request.url);
    const searchParams = {
      token: requestURL.searchParams.get('token'),
    };
    Logger.info({ searchParams });
    const searchParamsSchema = object({
      token: string().min(1).required(),
    });
    if (!searchParamsSchema.isValidSync(searchParams)) {
      return response;
    }
    const isTokenVerified = await UnsubscribeToken.verify(params.guest, searchParams.token);
    Logger.info({ isTokenVerified });
    if (!isTokenVerified) {
      return response;
    }
    const guest = await SupabaseQueries.findGuestFromId(params.guest);
    Logger.info({ guest });
    if (!guest) {
      return response;
    }
    waitUntil(async (): Promise<void> => {
      try {
        await SupabaseQueries.updateGuestSubscription(guest.id, false);
      } catch (error: unknown) {
        Logger.error(error);
      }
    });
    return response;
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
