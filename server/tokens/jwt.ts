import { JWTPayload, SignJWT, jwtVerify } from 'jose';

class JWT {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  public async sign(payload: object, expiresIn: number): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;

    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(this.secret));
  }

  public async verify(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(this.secret));
    return payload;
  }
}

export default JWT;
