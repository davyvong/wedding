import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import JWT from 'server/jwt';

import MySQLQueries from './queries/mysql';

export interface GuestTokenPayload extends JWTPayload {
  guestId: string;
  tokenId: string;
}

export interface VerifiedGuestTokenPayload extends GuestTokenPayload {
  isAdmin: boolean;
}

class Authenticator {
  public static async verifyToken(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<VerifiedGuestTokenPayload | undefined> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return undefined;
    }
    try {
      const payload = (await JWT.verify(tokenCookie.value)) as GuestTokenPayload;
      const guest = await MySQLQueries.findGuestFromId(payload.guestId);
      if (!guest) {
        return undefined;
      }
      return {
        ...payload,
        isAdmin: guest.isAdmin,
      };
    } catch {
      return undefined;
    }
  }

  public static async verifyTokenOrRedirect(
    cookies: RequestCookies | ReadonlyRequestCookies,
    redirectURL: string,
  ): Promise<VerifiedGuestTokenPayload | never> {
    const payload = await Authenticator.verifyToken(cookies);
    if (!payload) {
      return redirect(redirectURL);
    }
    return payload;
  }
}

export default Authenticator;
