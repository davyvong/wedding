import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import JWT from 'server/jwt';

interface GuestTokenPayload extends JWTPayload {
  id: string;
}

class GuestAuthenticator {
  public static async verifyToken(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<GuestTokenPayload | undefined> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return undefined;
    }
    try {
      const payload = await JWT.verify(tokenCookie.value);
      return payload as GuestTokenPayload;
    } catch {
      return undefined;
    }
  }

  public static async verifyTokenOrRedirect(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<GuestTokenPayload | never> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return redirect('/auth');
    }
    try {
      const payload = await JWT.verify(tokenCookie.value);
      return payload as GuestTokenPayload;
    } catch {
      return redirect('/auth');
    }
  }
}

export default GuestAuthenticator;
