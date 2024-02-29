import ServerEnvironment from 'server/environment';
import CryptoToken from 'server/tokens/crypto';

class UnsubscribeToken {
  public static async sign(guestId: string): Promise<string> {
    return CryptoToken.sign(guestId);
  }

  public static async verify(guestId: string, token: string): Promise<boolean> {
    return CryptoToken.verify(token, guestId);
  }

  public static async generateURL(guestId: string): Promise<string> {
    const token = await UnsubscribeToken.sign(guestId);
    const url = new URL(ServerEnvironment.getBaseURL());
    url.pathname = '/unsubscribe/' + guestId;
    url.searchParams.set('token', token);
    return url.href;
  }
}

export default UnsubscribeToken;
