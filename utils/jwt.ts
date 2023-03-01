import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';

export const signToken = (payload: Buffer | object | string): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string);

export const verifyToken = (token: string): Promise<string> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (error: VerifyErrors, decodedToken: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(decodedToken);
      }
    });
  });
