import { NextRequest, NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import Logger from 'utils/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const requestURL = new URL(request.url);
    const params = {
      redirect: requestURL.searchParams.get('redirect'),
    };
    Logger.info({ params });
    let redirectURL = ServerEnvironment.getBaseURL();
    if (params.redirect) {
      redirectURL += decodeURIComponent(params.redirect);
    }
    Logger.info({ redirectURL });
    const response = NextResponse.redirect(redirectURL);
    response.cookies.delete('token');
    return response;
  } catch (error: unknown) {
    ServerError.handleError(error);
    return NextResponse.redirect(ServerEnvironment.getBaseURL());
  }
};
