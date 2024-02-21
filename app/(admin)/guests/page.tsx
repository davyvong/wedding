import GuestList from 'components/guest-list';
import { FC } from 'react';
import { generateDefaultMetadata } from 'server/metadata';
import MySQLQueries from 'server/queries/mysql';

export const metadata = generateDefaultMetadata({
  url: '/guests',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const guestList = await MySQLQueries.findGuestList();
  const guestListData = guestList.map(guestGroup => ({
    guests: guestGroup.guests.map(guest => guest.valueOf()),
    id: guestGroup.id,
    responses: guestGroup.responses.map(response => response.valueOf()),
  }));

  return <GuestList guestList={guestListData} />;
};

export default Page;
