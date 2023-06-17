import RSVPGuestList from 'components/rsvp-guest-list';
import { cookies } from 'next/headers';
import GuestAuthenticator from 'server/authenticator';

const Page = async (): Promise<JSX.Element> => {
  await GuestAuthenticator.verifyTokenOrRedirect(cookies());

  return <RSVPGuestList />;
};

export default Page;
