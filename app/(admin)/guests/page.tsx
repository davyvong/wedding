import { kv } from '@vercel/kv';
import GuestList from 'components/guest-list';
import { unstable_noStore as noStore } from 'next/cache';
import { MDBGuestData } from 'server/models/guest';
import RedisKey from 'server/models/redis-key';
import { MDBResponseData } from 'server/models/response';
import MongoDBQueryTemplate from 'server/templates/mongodb';

const Page = async (): Promise<JSX.Element> => {
  noStore();

  const redisKey = RedisKey.create('guest-list');
  const cachedGuestList =
    await kv.get<{ guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[]>(redisKey);

  if (cachedGuestList) {
    return <GuestList guestList={cachedGuestList} />;
  }

  const guestList = await MongoDBQueryTemplate.findGuestList();
  await kv.set(redisKey, guestList, { ex: 300 });

  return <GuestList guestList={guestList} />;
};

export default Page;
