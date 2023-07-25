import ResponsiveGallery from 'components/responsive-gallery';

import { galleryImageList } from './constants';

const Page = async (): Promise<JSX.Element> => {
  return <ResponsiveGallery data={galleryImageList} />;
};

export default Page;
