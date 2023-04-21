import loginCodeTemplate from 'emails/login-code.eml';
import * as handlebars from 'handlebars';
import type { NextApiRequest, NextApiResponse } from 'next';
import words from 'constants/words.json';
import { getBaseURL } from 'server/env';
import MongoDBClient from 'server/clients/mongodb';
import NodemailerClient from 'server/clients/nodemailer';
import applyRateLimiter, { RateLimitScopes } from 'server/middlewares/rate-limiter';
import RedisClient from 'server/clients/redis';
import Validator from 'server/validator';

const getRandomWords = (count: number): string[] => {
  const set = new Set<string>();
  while (set.size < count) {
    const index = Math.floor(Math.random() * words.length);
    set.add(words[index]);
  }
  return Array.from(set);
};

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!Validator.isEmail(request.body.email)) {
      response.status(400).end();
      return;
    }
    const db = await MongoDBClient.getInstance();
    const doc = await db.collection('guests').findOne({ email: request.body.email });
    if (!doc) {
      response.status(400).end();
      return;
    }
    const code = getRandomWords(4).join('-');
    const url = new URL(getBaseURL() + '/api/auth/authorize');
    url.searchParams.set('code', code);
    const template = handlebars.compile(loginCodeTemplate);
    const html = template({ code, url: url.href });
    const transporter = NodemailerClient.getInstance();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS as string,
      html,
      subject: 'Your login code is ' + code,
      to: request.body.email,
    });
    const redisClient = await RedisClient.getInstance();
    const redisKey = RedisClient.getKey('codes', code);
    await redisClient.set(redisKey, doc._id.toString(), { EX: 900 });
    response.status(202).end();
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler, {
  requestsPerInterval: 10,
  scope: RateLimitScopes.EmailAuthentication,
});
