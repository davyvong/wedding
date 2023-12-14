import Layout from 'app/(public)/layout';
import Translate from 'client/translate';
import ErrorPage from 'components/error-page';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';
import MongoDBQueryTemplate from 'server/templates/mongodb';

import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token) {
    return <ErrorPage statusCode={404} />;
  }

  if (token.id !== '63fe7a21f84a8c95268a690d' && token.id !== '6411d98cc0b167e3e42eb851') {
    return <ErrorPage statusCode={404} />;
  }

  const guestGroups = await MongoDBQueryTemplate.findAllGuestGroups();

  const sortByKey = (key: string) => (a, b) => {
    if (!a[key]) {
      return 1;
    }
    if (!b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    }
    return 0;
  };

  const renderSeparator = (): JSX.Element => (
    <tr className={styles.guestTableSeparator}>
      <td colSpan={3}>
        <hr />
      </td>
    </tr>
  );

  const renderGuestGroup = (guestGroup): JSX.Element => (
    <Fragment key={guestGroup.id}>
      {renderSeparator()}
      <tr className={styles.guestGroupHeader}>
        <td colSpan={3}>
          {guestGroup.id
            ? Translate.t('app.guests.guest-groups.name', { name: guestGroup.id })
            : Translate.t('app.guests.guest-groups.individual')}
        </td>
      </tr>
      {guestGroup.guests.sort(sortByKey('name')).map(guest => (
        <tr key={guest.id}>
          <td>{guest.id}</td>
          <td>{guest.name}</td>
          <td>{guest.email}</td>
        </tr>
      ))}
    </Fragment>
  );

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.guestList}>
          <table className={styles.guestTable}>
            <thead>
              <tr>
                <th>{Translate.t('app.guests.guest-table.columns.id')}</th>
                <th>{Translate.t('app.guests.guest-table.columns.name')}</th>
                <th>{Translate.t('app.guests.guest-table.columns.email')}</th>
              </tr>
            </thead>
            <tbody>{guestGroups.sort(sortByKey('id')).map(renderGuestGroup)}</tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
