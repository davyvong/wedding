import RSVPEmailCheck from 'components/rsvp-email-check';
import RSVPGuestList from 'components/rsvp-guest-list';
import { cookies } from 'next/headers';
import GuestAuthenticator from 'server/authenticator';

const Page = async (): Promise<JSX.Element> => {
  const token = await GuestAuthenticator.verifyToken(cookies());

  return token ? <RSVPGuestList /> : <RSVPEmailCheck />;
};

export default Page;
