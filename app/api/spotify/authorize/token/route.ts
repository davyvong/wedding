import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    if (!ServerEnvironment.isDevelopment) {
      return ServerError.NotFound();
    }
    const requestURL = new URL(request.url);
    const searchParams = {
      code: requestURL.searchParams.get('code'),
    };
    Logger.info({ searchParams });
    const searchParamsSchema = object({
      code: string().required().min(1),
    });
    if (!searchParamsSchema.isValidSync(searchParams)) {
      return ServerError.BadRequest();
    }
    const refreshToken = await SpotifyAPI.getRefreshToken(searchParams.code);
    return NextResponse.json({ token: refreshToken }, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
