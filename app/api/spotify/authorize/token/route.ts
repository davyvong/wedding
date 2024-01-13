import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    if (!ServerEnvironment.isDevelopment) {
      throw new ServerError({
        code: ServerErrorCode.MethodNotAllowed,
        status: 405,
      });
    }
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    const paramsSchema = object({
      code: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        status: 400,
      });
    }
    const refreshToken = await SpotifyAPI.getRefreshToken(params.code);
    return NextResponse.json({ token: refreshToken }, { status: 200 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
