import { cookies } from 'next/headers';
import GuestAuthenticator from 'server/authenticator';

interface PageProps {
  params: {
    guestId: string;
  };
}

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  await GuestAuthenticator.verifyTokenOrRedirect(cookies());

  return <div>{params.guestId}</div>;
};

export default Page;
