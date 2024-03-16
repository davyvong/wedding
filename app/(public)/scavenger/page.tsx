import ScavengerHunt from 'components/scavenger-hunt';
import { cookies } from 'next/headers';
import { FC } from 'react';
import { generateDefaultMetadata } from 'server/metadata';
import ScavengerHuntToken from 'server/tokens/scavenger-hunt';

export const metadata = generateDefaultMetadata({
  url: '/scavenger',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const token = await ScavengerHuntToken.verify(cookies());

  if (token) {
    return <ScavengerHunt token={token} />;
  }

  return <ScavengerHunt />;
};

export default Page;
