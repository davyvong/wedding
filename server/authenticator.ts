import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import SupabaseQueries from 'server/queries/supabase';
import JWT from 'server/tokens/jwt';
import Logger from 'utils/logger';

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
      const jwt = new JWT(process.env.JWT_SECRET);
      const payload = (await jwt.verify(tokenCookie.value)) as GuestTokenPayload;
      Logger.info({ token: payload });
      const guest = await SupabaseQueries.findGuestFromId(payload.guestId);
      Logger.info({ guest });
      if (!guest) {
        return undefined;
      }
      return {
        ...payload,
        isAdmin: guest.isAdmin,
      };
    } catch (error: unknown) {
      Logger.error(error);
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
