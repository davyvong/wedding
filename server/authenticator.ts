import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import JWT from 'server/jwt';

interface GuestTokenPayload extends JWTPayload {
  id: string;
}

class GuestAuthenticator {
  public static async verifyToken(cookies: RequestCookies): Promise<GuestTokenPayload | undefined> {
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
}

export default GuestAuthenticator;
