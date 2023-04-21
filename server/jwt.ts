import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';

export interface Token {
  iat: number;
  id: string;
}

class JWT {
  public static sign(payload: Buffer | object | string): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string);
  }

  public static verify(token: string): Promise<Token | undefined> {
    return new Promise(resolve => {
      jwt.verify(token, process.env.JWT_SECRET as string, (error: VerifyErrors, decodedToken?: Token) => {
        if (error) {
          resolve(undefined);
        } else {
          resolve(decodedToken);
        }
      });
    });
  }
}

export default JWT;
