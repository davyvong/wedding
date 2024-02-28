import Translate from 'client/translate';
import words from 'constants/words.json';
import Handlebars from 'handlebars';
import { NextRequest } from 'next/server';
import NodemailerClientFactory from 'server/clients/nodemailer';
import RedisClientFactory from 'server/clients/redis';
import secretLinkTemplate from 'server/emails/secret.eml';
import ServerEnvironment from 'server/environment';
import ServerError from 'server/error';
import RedisKey from 'server/models/redis-key';
import MySQLQueries from 'server/queries/mysql';
import UnsubscribeToken from 'server/tokens/unsubscribe';
import { object, string } from 'yup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const body = await request.json();
    const bodySchema = object({
      email: string().email().required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return ServerError.BadRequest();
    }
    const email = body.email.toLowerCase();
    const guest = await MySQLQueries.findGuestFromEmail(email);
    if (!guest) {
      return ServerError.Forbidden();
    }
    const code = getRandomWords(4).join('-');
    console.log(`[POST] /api/secret/email code=${code}`);
    const secretURL = new URL(ServerEnvironment.getBaseURL() + '/secret/' + code);
    const unsubscribeURL = await UnsubscribeToken.generateURL(guest.email, guest.id);
    console.log(`[POST] /api/secret/email unsubscribeURL=${unsubscribeURL}`);
    const template = Handlebars.compile(secretLinkTemplate);
    const html = template({ url: secretURL.href });
    const transporter = NodemailerClientFactory.getInstance();
    await transporter.sendMail({
      from: process.env.NODEMAILER_ADDRESS,
      html,
      list: {
        unsubscribe: {
          comment: Translate.t('app.api.secret.email.unsubscribe'),
          url: unsubscribeURL,
        },
      },
      subject: Translate.t('app.api.secret.email.subject'),
      to: email,
    });
    const redisClient = RedisClientFactory.getInstance();
    const redisKey = RedisKey.create('codes', code);
    await redisClient.set<string>(redisKey, guest.id, { ex: 900 });
    return new Response(null, { status: 202 });
  } catch (error: unknown) {
    return ServerError.handleError(error);
  }
};
