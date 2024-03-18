import { JWTPayload } from 'jose';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import JWT from 'server/tokens/jwt';

export interface ScavengerHuntTokenPayload extends JWTPayload {
  tokenId: string;
  username: string;
}

class ScavengerHuntToken {
  public static async sign(tokenId: string, username: string, expiresIn: number): Promise<string> {
    const jwt = new JWT(process.env.JWT_SECRET_SCAVENGER);
    return jwt.sign({ tokenId, username }, expiresIn);
  }

  public static async verify(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<ScavengerHuntTokenPayload | undefined> {
    try {
      const tokenCookie = cookies.get('token_sh');
      if (!tokenCookie) {
        return undefined;
      }
      const jwt = new JWT(process.env.JWT_SECRET_SCAVENGER);
      return (await jwt.verify(tokenCookie.value)) as ScavengerHuntTokenPayload;
    } catch {
      return undefined;
    }
  }
}

export default ScavengerHuntToken;
