import ScavengerHunt from 'components/scavenger-hunt';
import { cookies } from 'next/headers';
import { FC } from 'react';
import { generateDefaultMetadata } from 'server/metadata';
import JWT from 'server/tokens/jwt';

export const metadata = generateDefaultMetadata({
  url: '/scavenger',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const tokenCookie = cookies().get('token_sh');

  if (tokenCookie) {
    try {
      const token = await JWT.verify(tokenCookie.value);
      return <ScavengerHunt token={token} />;
    } catch (error: unknown) {
      // Unable to verify token
    }
  }

  return <ScavengerHunt />;
};

export default Page;
