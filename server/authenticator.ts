import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import JWT from 'server/jwt';

import MongoDBQueryTemplate from './templates/mongodb';

export interface GuestTokenPayload extends JWTPayload {
  id: string;
}

class Authenticator {
  public static async verifyToken(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<GuestTokenPayload | undefined> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return undefined;
    }
    try {
      const payload = (await JWT.verify(tokenCookie.value)) as GuestTokenPayload;
      const guest = await MongoDBQueryTemplate.findGuestFromId(payload.id);
      if (!guest) {
        return undefined;
      }
      return payload;
    } catch {
      return undefined;
    }
  }

  public static async verifyTokenOrRedirect(
    cookies: RequestCookies | ReadonlyRequestCookies,
    redirectURL: string,
  ): Promise<GuestTokenPayload | never> {
    const payload = await Authenticator.verifyToken(cookies);
    if (!payload) {
      return redirect(redirectURL);
    }
    return payload;
  }
}

export default Authenticator;
