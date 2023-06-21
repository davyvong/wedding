import words from 'constants/words.json';
import Handlebars from 'handlebars';
import { NextRequest } from 'next/server';
import MongoDBClientFactory from 'server/clients/mongodb';
import NodemailerClientFactory from 'server/clients/nodemailer';
import RedisClientFactory from 'server/clients/redis';
import secretLinkTemplate from 'server/emails/secret-link.eml';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
import { MongoDBDocumentConverter } from 'server/utils/mongodb';
import { RedisKeyBuilder } from 'server/utils/redis';
import { object, string } from 'yup';

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
      requestsPerInterval: 10,
      scope: RateLimiterScope.EmailAuthentication,
    });
    const checkResults = await rateLimiter.checkRequest(request);
    if (checkResults.exceeded) {
      return new Response(undefined, { status: 429 });
    }
    const body = await request.json();
    const bodySchema = object({
      email: string().email().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    const email = body.email.toLowerCase();
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ email });
    if (!doc) {
      return new Response(undefined, { status: 401 });
    }
    const code = getRandomWords(4).join('-');
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/secret-link/authorize');
    url.searchParams.set('code', code);
    const template = Handlebars.compile(secretLinkTemplate);
    const html = template({ url: url.href });
    const transporter = NodemailerClientFactory.getInstance();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS,
      html,
      subject: 'Your secret link from Vivian & Davy',
      to: email,
    });
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = new RedisKeyBuilder().set('codes', code).toString();
    const guest = MongoDBDocumentConverter.toGuest(doc);
    await redisClient.set(redisKey, guest.id, { EX: 900 });
    return new Response(undefined, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handle(error);
  }
};
