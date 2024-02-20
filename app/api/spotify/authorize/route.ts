import { NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (): Promise<Response> => {
  try {
    if (!ServerEnvironment.isDevelopment) {
      return ServerError.MethodNotAllowed();
    }
    const authorizationURL = SpotifyAPI.getAuthorizationURL();
    return NextResponse.redirect(authorizationURL);
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
