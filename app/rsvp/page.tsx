import AuthenticationButton from 'components/authentication-button';
import RSVPGuestList from 'components/rsvp-guest-list';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import GuestAuthenticator from 'server/authenticator';

const Page = async (): Promise<JSX.Element> => {
  const token = await GuestAuthenticator.verifyToken(cookies());

  return <Fragment>{token ? <RSVPGuestList /> : <AuthenticationButton />}</Fragment>;
};

export default Page;
