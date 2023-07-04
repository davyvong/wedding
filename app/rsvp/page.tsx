import RSVPGuestList from 'components/rsvp-guest-list';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Authenticator from 'server/authenticator';
import MongoDBQueryTemplate from 'server/templates/mongodb';

const Page = async (): Promise<JSX.Element> => {
  const token = await Authenticator.verifyTokenOrRedirect(cookies());

  const rsvp = await MongoDBQueryTemplate.findRSVPFromGuestId(token.id);

  if (!rsvp) {
    return redirect('/secret-link');
  }

  return <RSVPGuestList {...rsvp} token={token} />;
};

export default Page;
