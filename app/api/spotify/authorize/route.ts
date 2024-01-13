import { NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';

export const dynamic = 'force-dynamic';

export const GET = async (): Promise<Response> => {
  try {
    if (!ServerEnvironment.isDevelopment) {
      throw new ServerError({
        code: ServerErrorCode.MethodNotAllowed,
        status: 405,
      });
    }
    const authorizationURL = SpotifyAPI.getAuthorizationURL();
    return NextResponse.redirect(authorizationURL);
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
