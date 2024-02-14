import words from 'constants/words.json';
import Handlebars from 'handlebars';
import { NextRequest } from 'next/server';
import NodemailerClientFactory from 'server/clients/nodemailer';
import RedisClientFactory from 'server/clients/redis';
import secretLinkTemplate from 'server/emails/secret.eml';
import ServerEnvironment from 'server/environment';
import ServerError, { ServerErrorCode } from 'server/error';
import RedisKey from 'server/models/redis-key';
import MySQLQueries from 'server/queries/mysql';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';

const getRandomWords = (count: number): string[] => {
  const set = new Set<string>();
  while (set.size < count) {
    const index = Math.floor(Math.random() * words.length);
    set.add(words[index]);
  }
  return Array.from(set);
};

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const rateLimiter = new RateLimiter({
      requestsPerInterval: 25,
      scope: RateLimiterScope.SecretEmail,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      throw new ServerError({
        code: ServerErrorCode.TooManyRequests,
        rateLimit: checkResults,
        status: 429,
      });
    }
    const body = await request.json();
    const bodySchema = object({
      email: string().email().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      throw new ServerError({
        code: ServerErrorCode.BadRequest,
        rateLimit: checkResults,
        status: 400,
      });
    }
    const email = body.email.toLowerCase();
    const guest = await MySQLQueries.findGuestFromEmail(email);
    if (!guest) {
      throw new ServerError({
        code: ServerErrorCode.Forbidden,
        rateLimit: checkResults,
        status: 403,
      });
    }
    const code = getRandomWords(4).join('-');
    console.log('[POST]', '/api/secret/email', `code=${code}`);
    const url = new URL(ServerEnvironment.getBaseURL() + '/secret/' + code);
    const template = Handlebars.compile(secretLinkTemplate);
    const html = template({ url: url.href });
    const transporter = NodemailerClientFactory.getInstance();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS,
      html,
      subject: 'Your secret link from Vivian & Davy',
      to: email,
    });
    const redisClient = RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('codes', code);
    await redisClient.set(redisKey, guest.id, { ex: 900 });
    return new Response(undefined, {
      headers: RateLimiter.toHeaders(checkResults),
      status: 202,
    });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
