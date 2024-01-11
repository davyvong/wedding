import { NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';

export const GET = async (): Promise<Response> => {
  if (!ServerEnvironment.isDevelopment) {
    const response = await fetch(ServerEnvironment.getBaseURL() + '/404');
    const responseText = await response.text();
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      status: 404,
    });
  }
  const authorizationURL = SpotifyAPI.getAuthorizationURL();
  return NextResponse.redirect(authorizationURL);
};
