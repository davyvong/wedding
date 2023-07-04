import RSVPForm from 'components/rsvp-form';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Authenticator from 'server/authenticator';
import MongoDBQueryTemplate from 'server/templates/mongodb';

interface PageProps {
  params: {
    guestId: string;
  };
}

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const token = await Authenticator.verifyTokenOrRedirect(cookies());

  const rsvp = await MongoDBQueryTemplate.findRSVPFromGuestId(token.id);

  if (!rsvp) {
    return redirect('/secret-link');
  }

  return <RSVPForm {...rsvp} id={params.guestId} />;
};

export default Page;
