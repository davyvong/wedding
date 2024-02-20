import Landing from 'components/landing';
import { FC } from 'react';
import { generateDefaultMetadata } from 'utils/metadata';

export const metadata = generateDefaultMetadata({
  url: '/',
});

const Page: FC = () => <Landing />;

export default Page;
