import Landing from 'components/landing';
import NavigationBar from 'components/navigation-bar';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

const Page = async (): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return (
    <Fragment>
      <NavigationBar token={token} />
      <Landing />
    </Fragment>
  );
};

export default Page;
