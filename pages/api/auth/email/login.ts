import serverErrors from 'constants/server-errors.json';
import loginCodeTemplate from 'emails/login-code.eml';
import * as handlebars from 'handlebars';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBaseURL } from 'utils/env';
import { getMongoDatabase } from 'utils/mongodb';
import { getTransporter } from 'utils/nodemailer';
import { applyRateLimiter } from 'utils/rate-limiter';
import { createRedisKey, getRedisClient } from 'utils/redis';
import { getRandomWords } from 'utils/words';
import { isEmail } from 'utils/yup';

const handler = async (request: NextApiRequest, response: NextApiResponse): Promise<void> => {
  try {
    if (!isEmail(request.body.email)) {
      throw new Error(serverErrors.invalidEmail);
    }
    const db = await getMongoDatabase();
    const collection = db.collection('guests');
    const doc = await collection.findOne({ email: request.body.email });
    if (!doc) {
      throw new Error(serverErrors.guestNotFound);
    }
    const code = getRandomWords(4).join('-');
    const url = new URL(getBaseURL() + '/api/auth/email/check');
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
  } catch (error) {
    console.error(error.message);
  } finally {
    response.status(202).end();
  }
};

export default applyRateLimiter(handler, {
  requestsPerInterval: 10,
  scope: 'api-auth-email-login',
});
