import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';

interface JWT {
  iat: number;
  id: string;
}

export const signToken = (payload: Buffer | object | string): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string);

export const verifyToken = (token: string): Promise<JWT | undefined> =>
  new Promise(resolve => {
    jwt.verify(token, process.env.JWT_SECRET as string, (error: VerifyErrors, decodedToken?: JWT) => {
      if (error) {
        resolve(undefined);
      } else {
        resolve(decodedToken);
      }
    });
  });
