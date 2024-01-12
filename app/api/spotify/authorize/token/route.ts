import { NextRequest, NextResponse } from 'next/server';
import SpotifyAPI from 'server/apis/spotify';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import { object, string } from 'yup';

export const GET = async (request: NextRequest): Promise<Response> => {
  if (!ServerEnvironment.isDevelopment) {
    return ServerError.to404Page();
  }
  try {
    const requestURL = new URL(request.url);
    const params = {
      code: requestURL.searchParams.get('code'),
    };
    const paramsSchema = object({
      code: string().required().min(1),
    });
    if (!paramsSchema.isValidSync(params)) {
      return new Response(undefined, { status: 400 });
    }
    const refreshToken = await SpotifyAPI.getRefreshToken(params.code);
    return NextResponse.json({ token: refreshToken }, { status: 200 });
  } catch (error) {
    return new Response(undefined, { status: 500 });
  }
};
