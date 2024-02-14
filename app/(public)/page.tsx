import Landing from 'components/landing';
import { FC } from 'react';
import { generateDefaultMetadata } from 'utils/metadata';

export const metadata = generateDefaultMetadata({
  url: '/',
});
export const runtime = 'edge';

const Page: FC = async () => <Landing />;

export default Page;
