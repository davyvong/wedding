import dynamic from 'next/dynamic';

const DynamicScavengerHuntSubmissions = dynamic(() => import('./component'), {
  ssr: false,
});

export default DynamicScavengerHuntSubmissions;
