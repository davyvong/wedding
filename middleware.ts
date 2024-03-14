import { NextRequest, NextResponse } from 'next/server';
import { GuestTokenPayload } from 'server/authenticator';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RateLimiter from 'server/rate-limiter';
import JWT from 'server/tokens/jwt';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';
import Logger from 'utils/logger';
import { string } from 'yup';

export const config = {
  matcher: ['/', '/api/:path*', '/guests'],
};

async function middleware(request: NextRequest): Promise<Response> {
  const response = NextResponse.next();
  if (!ServerEnvironment.isDevelopment) {
    if (!request.ip) {
      return ServerError.InternalServerError();
    }
    const ipSchema = string()
      .required()
      .min(7)
      .max(15)
      .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
    if (!ipSchema.isValidSync(request.ip)) {
      return ServerError.BadRequest();
    }
    const rateLimiter = new RateLimiter({
      interval: 30000,
      maxTokens: 180,
      refillRate: 90,
    });
    const { limit, remaining, reset, success } = await rateLimiter.limit(request.ip);
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
    if (!success) {
      return ServerError.TooManyRequests(response.headers);
    }
  }
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    try {
      const payload = (await JWT.verify(tokenCookie.value)) as GuestTokenPayload;
      Logger.info({ payload });
      const nextMonthDate = new Date();
      nextMonthDate.setDate(nextMonthDate.getDate() + 30);
      if (payload?.exp && payload.exp < nextMonthDate.getTime() / 1000) {
        const expiresIn90Days = 7776000;
        const token = await JWT.sign(payload, expiresIn90Days);
        Logger.info({ token });
        const expiryDate = new Date(Date.now() + expiresIn90Days * 1000);
        response.cookies.set('token', token, { expires: expiryDate });
      }
    } catch (error: unknown) {
      Logger.error(error);
    }
  }
  const scavengerTokenCookie = request.cookies.get('token_sh');
  if (scavengerTokenCookie) {
    try {
      const payload = await ScavengerHuntToken.verify(request.cookies);
      Logger.info({ payload });
      const next3MonthsDate = new Date();
      next3MonthsDate.setFullYear(next3MonthsDate.getFullYear() + 1);
      if (payload?.exp && payload.exp < next3MonthsDate.getTime() / 1000) {
        const expiresIn1Year = 31536000;
        const signedToken = await ScavengerHuntToken.sign(payload.tokenId, payload.username, expiresIn1Year);
        Logger.info({ signedToken });
        const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
        response.cookies.set('token_sh', signedToken, { expires: expiryDate });
      }
    } catch (error: unknown) {
      Logger.error(error);
    }
  }
  return response;
}

export default middleware;
