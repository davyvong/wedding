import GuestList from 'components/guest-list';
import RedisClientFactory from 'server/clients/redis';
import { GuestData } from 'server/models/guest';
import RedisKey from 'server/models/redis-key';
import { ResponseData } from 'server/models/response';
import MySQLQueries from 'server/queries/mysql';

const Page = async (): Promise<JSX.Element> => {
  const redisClient = RedisClientFactory.getInstance();
  const redisKey = RedisKey.create('guest-list');
  const cachedGuestList =
    await redisClient.get<{ guests: GuestData[]; id: string; responses: ResponseData[] }[]>(redisKey);

  if (cachedGuestList) {
    return <GuestList guestList={cachedGuestList} />;
  }

  const guestList = await MySQLQueries.findGuestList();
  const guestListData = guestList.map(guestGroup => ({
    guests: guestGroup.guests.map(guest => guest.valueOf()),
    id: guestGroup.id,
    responses: guestGroup.responses.map(response => response.valueOf()),
  }));
  await redisClient.set(redisKey, guestListData, { ex: 60 });

  return <GuestList guestList={guestListData} />;
};

export default Page;
