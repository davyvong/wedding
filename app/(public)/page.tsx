import Landing from 'components/landing';
import { cookies } from 'next/headers';
import { FC } from 'react';
import Authenticator, { VerifiedGuestTokenPayload } from 'server/authenticator';
import { generateDefaultMetadata } from 'server/metadata';

export const metadata = generateDefaultMetadata({
  url: '/',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const token: VerifiedGuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return <Landing token={token} />;
};

export default Page;
