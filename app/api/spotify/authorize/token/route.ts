import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    if (!ServerEnvironment.isDevelopment) {
      return ServerError.MethodNotAllowed();
    }
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    const paramsSchema = object({
      code: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      return ServerError.BadRequest();
    }
    const refreshToken = await SpotifyAPI.getRefreshToken(params.code);
    return NextResponse.json({ token: refreshToken }, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
