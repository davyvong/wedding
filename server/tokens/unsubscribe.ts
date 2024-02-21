import { JWTPayload } from 'jose';
import ServerEnvironment from 'server/environment';
import JWT from 'server/tokens/jwt';

export interface UnsubscribeTokenPayload extends JWTPayload {
  guestEmail: string;
  guestId: string;
}

class UnsubscribeToken {
  public static async sign(guestEmail: string, guestId: string): Promise<string> {
    const payload: UnsubscribeTokenPayload = {
      guestEmail,
      guestId,
    };
    return JWT.sign(payload);
  }

  public static async verify(token: string): Promise<UnsubscribeTokenPayload> {
    return (await JWT.verify(token)) as UnsubscribeTokenPayload;
  }

  public static async generateURL(guestEmail: string, guestId: string): Promise<string> {
    const token = await UnsubscribeToken.sign(guestEmail, guestId);
    const url = new URL(ServerEnvironment.getBaseURL() + '/unsubscribe/' + token);
    return url.href;
  }
}

export default UnsubscribeToken;
