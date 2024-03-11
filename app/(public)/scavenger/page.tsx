import ScavengerHunt from 'components/scavenger-hunt';
import { FC } from 'react';
import { generateDefaultMetadata } from 'server/metadata';

export const metadata = generateDefaultMetadata({
  url: '/scavenger',
});

const Page: FC = () => {
  return <ScavengerHunt />;
};

export default Page;
