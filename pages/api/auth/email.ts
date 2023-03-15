import loginCodeTemplate from 'emails/login-code.eml';
import * as handlebars from 'handlebars';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRandomWords } from 'server/codes';
import { getBaseURL } from 'server/env';
import { getMongoDatabase } from 'server/mongodb';
import { getTransporter } from 'server/nodemailer';
import { applyRateLimiter } from 'server/rate-limiter';
import { createRedisKey, getRedisClient } from 'server/redis';
import { isEmail } from 'utils/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!isEmail(request.body.email)) {
      response.status(400).end();
      return;
    }
    const db = await getMongoDatabase();
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
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS as string,
      html,
      subject: 'Your login code is ' + code,
      to: request.body.email,
    });
    const redisClient = await getRedisClient();
    const redisKey = createRedisKey('codes', code);
    await redisClient.set(redisKey, doc._id.toString(), { EX: 900 });
    response.status(202).end();
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
};

export default applyRateLimiter(handler, {
  requestsPerInterval: 10,
  scope: 'api-auth-email-login',
});
