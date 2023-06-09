import words from 'constants/words.json';
import * as handlebars from 'handlebars';
import { NextRequest } from 'next/server';
import { MongoDBDocumentBuilder } from 'server/builders/mongodb';
import { RedisKeyBuilder } from 'server/builders/redis';
import MongoDBClientFactory from 'server/clients/mongodb';
import NodemailerClientFactory from 'server/clients/nodemailer';
import RedisClientFactory from 'server/clients/redis';
import loginCodeTemplate from 'server/emails/login-code.eml';
import ServerEnvironment from 'server/environment';
import RateLimiter, { RateLimiterScope } from 'server/rate-limiter';
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
    const db = await MongoDBClientFactory.getInstance();
    const doc = await db.collection('guests').findOne({ email: body.email });
    if (!doc) {
      return new Response(undefined, { status: 400 });
    }
    const code = getRandomWords(4).join('-');
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/auth/authorize');
    url.searchParams.set('code', code);
    const template = handlebars.compile(loginCodeTemplate);
    const html = template({ code, url: url.href });
    const transporter = NodemailerClientFactory.getInstance();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS,
      html,
      subject: 'Your login code is ' + code,
      to: body.email,
    });
    const redisClient = await RedisClientFactory.getInstance();
    const redisKey = new RedisKeyBuilder().set('codes', code).toString();
    const guest = new MongoDBDocumentBuilder(doc).toGuest();
    await redisClient.set(redisKey, guest.id, { EX: 900 });
    return new Response(undefined, { status: 202 });
  } catch (error: unknown) {
    console.log(error);
    return new Response(undefined, { status: 500 });
  }
};
