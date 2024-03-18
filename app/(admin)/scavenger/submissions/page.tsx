import ScavengerHuntSubmissions from 'components/scavenger-hunt-submissions';
import { FC } from 'react';
import RedisClientFactory from 'server/clients/redis';
import { generateDefaultMetadata } from 'server/metadata';
import RedisKey from 'server/models/redis-key';

import { ScavengerHuntSubmission, fetchAllSubmissions } from './actions';

export const metadata = generateDefaultMetadata({
  url: '/scavenger/submissions',
});
export const runtime = 'edge';

const Page: FC = async () => {
  const redisClient = RedisClientFactory.getInstance();
  const redisKey = RedisKey.create('scavenger-hunt', 'all');
  const cachedSubmissions = await redisClient.get<ScavengerHuntSubmission[]>(redisKey);

  if (cachedSubmissions) {
    return <ScavengerHuntSubmissions submissions={cachedSubmissions} />;
  }

  const submissions = await fetchAllSubmissions();
  await redisClient.set<ScavengerHuntSubmission[]>(redisKey, submissions, { ex: 60 });

  return <ScavengerHuntSubmissions submissions={submissions} />;
};

export default Page;
