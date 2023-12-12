import dynamic from 'next/dynamic';

const DynamicLanding = dynamic(() => import('./component'), {
  ssr: false,
});

export default DynamicLanding;
