import GuestList from 'components/guest-list';
import RedisClientFactory from 'server/clients/redis';
import RedisKey from 'server/models/redis-key';
import MongoDBQueryTemplate from 'server/templates/mongodb';

const Page = async (): Promise<JSX.Element> => {
  const redisClient = await RedisClientFactory.getInstance();
  const redisKey = RedisKey.create('guest-list');
  const cachedGuestList = await redisClient.get(redisKey);

  if (cachedGuestList) {
    return <GuestList guestList={JSON.parse(cachedGuestList)} />;
  }

  const guestList = await MongoDBQueryTemplate.findGuestList();
  await redisClient.set(redisKey, JSON.stringify(guestList), { EX: 60 });

  return <GuestList guestList={guestList} />;
};

export default Page;
