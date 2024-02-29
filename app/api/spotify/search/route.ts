import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import Authenticator from 'server/authenticator';
import ServerError from 'server/error';
import Logger from 'utils/logger';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const requestURL = new URL(request.url);
    const searchParams = {
      query: requestURL.searchParams.get('query'),
    };
    Logger.info({ searchParams });
    const searchParamsSchema = object({
      query: string().required().min(1).max(256),
    });
    if (!searchParamsSchema.isValidSync(searchParams)) {
      return ServerError.BadRequest();
    }
    const token = await Authenticator.verifyToken(request.cookies);
    if (!token) {
      return ServerError.Unauthorized();
    }
    const accessToken = await SpotifyAPI.getAccessToken();
    const results = await SpotifyAPI.searchForTrack(accessToken, searchParams.query);
    Logger.info({ results });
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 's-maxage=604800, stale-while-revalidate=86400',
      },
      status: 200,
    });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
