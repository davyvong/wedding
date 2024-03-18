import { FC } from 'react';
import { ScavengerHuntTokenPayload } from 'server/tokens/scavenger-hunt';

import { fetchSubmissions } from './actions';
import ScavengerHuntComponent from './component';

interface ScavengerHuntProps {
  token?: ScavengerHuntTokenPayload;
}

const ScavengerHunt: FC<ScavengerHuntProps> = async props => {
  const submissions = await fetchSubmissions();

  return <ScavengerHuntComponent {...props} submissions={submissions?.tasks || []} />;
};

export default ScavengerHunt;
