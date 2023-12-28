import GuestList from 'components/guest-list';
import RedisClientFactory from 'server/clients/redis';
import { MDBGuestData } from 'server/models/guest';
import RedisKey from 'server/models/redis-key';
import { MDBResponseData } from 'server/models/response';
import MongoDBQueryTemplate from 'server/templates/mongodb';

const Page = async (): Promise<JSX.Element> => {
  const redisClient = RedisClientFactory.getInstance();
  const redisKey = RedisKey.create('guest-list');
  const cachedGuestList =
    await redisClient.get<{ guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[]>(redisKey);

  if (cachedGuestList) {
    return <GuestList guestList={cachedGuestList} />;
  }

  const guestList = await MongoDBQueryTemplate.findGuestList();
  await redisClient.set(redisKey, guestList, { ex: 300 });

  return <GuestList guestList={guestList} />;
};

export default Page;
