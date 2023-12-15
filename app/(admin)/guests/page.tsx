import ErrorPage from 'components/error-page';
import GuestList from 'components/guest-list';
import { cookies } from 'next/headers';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';
import RedisClientFactory from 'server/clients/redis';
import RedisKey from 'server/models/redis-key';
import MongoDBQueryTemplate from 'server/templates/mongodb';

const adminGuestIds = new Set<string>(['63fe7a21f84a8c95268a690d', '6411d98cc0b167e3e42eb851']);

const Page = async (): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token || !adminGuestIds.has(token.id)) {
    return <ErrorPage statusCode={404} />;
  }

  const redisClient = await RedisClientFactory.getInstance();
  const redisKey = RedisKey.create('guest-list');
  const cachedGuestList = await redisClient.get(redisKey);

  if (cachedGuestList) {
    return <GuestList guestList={JSON.parse(cachedGuestList)} />;
  }

  const guestList = await MongoDBQueryTemplate.findGuestList();
  await redisClient.set(redisKey, JSON.stringify(guestList), { EX: 900 });

  return <GuestList guestList={guestList} />;
};

export default Page;
