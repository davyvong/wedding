import ErrorPage from 'components/error-page';
import GuestList from 'components/guest-list';
import { cookies } from 'next/headers';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';
import MongoDBQueryTemplate from 'server/templates/mongodb';

import styles from './page.module.css';

const adminGuestIds = new Set<string>(['63fe7a21f84a8c95268a690d', '6411d98cc0b167e3e42eb851']);

const Page = async (): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token || !adminGuestIds.has(token.id)) {
    return <ErrorPage statusCode={404} />;
  }

  const guestList = await MongoDBQueryTemplate.findGuestList();

  return (
    <div className={styles.page}>
      <GuestList guestList={guestList} />
    </div>
  );
};

export default Page;
