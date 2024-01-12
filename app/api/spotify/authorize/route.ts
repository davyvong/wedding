import { NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';

export const GET = async (): Promise<Response> => {
  if (!ServerEnvironment.isDevelopment) {
    return ServerError.to404Page();
  }
  const authorizationURL = SpotifyAPI.getAuthorizationURL();
  return NextResponse.redirect(authorizationURL);
};
