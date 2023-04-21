import type { NextApiRequest, NextApiResponse } from 'next';
import JWT from 'server/jwt';
import type { Token } from 'server/jwt';

export interface NextApiRequestWithToken extends NextApiRequest {
  token: Token;
}

const applyToken =
  (next): ((request: NextApiRequest, response: NextApiResponse) => unknown) =>
  async (request: NextApiRequestWithToken, response: NextApiResponse): Promise<void> => {
    try {
      if (!request.cookies.token) {
        response.status(401).end();
        return;
      }
      const token = await JWT.verify(request.cookies.token);
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

export default applyToken;
