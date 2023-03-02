import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

interface JWT {
  iat: number;
  id: string;
}

export interface NextApiRequestWithToken extends NextApiRequest {
  token: JWT;
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

export const applyToken =
  (next): ((request: NextApiRequest, response: NextApiResponse) => unknown) =>
  async (request: NextApiRequestWithToken, response: NextApiResponse): Promise<void> => {
    try {
      if (!request.cookies.token) {
        response.status(401).end();
        return;
      }
      const token = await verifyToken(request.cookies.token);
      if (!token) {
        response.status(401).end();
        return;
      }
      request.token = token;
      await next(request, response);
    } catch (error) {
      console.log(error);
      response.status(401).end();
    }
  };
