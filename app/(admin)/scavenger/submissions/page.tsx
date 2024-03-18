import ScavengerHuntSubmissions from 'components/scavenger-hunt-submissions';
import { FC } from 'react';
import { generateDefaultMetadata } from 'server/metadata';

import { fetchAllSubmissions } from './actions';

export const metadata = generateDefaultMetadata({
  url: '/scavenger/submissions',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const submissions = await fetchAllSubmissions();

  return <ScavengerHuntSubmissions submissions={submissions} />;
};

export default Page;
