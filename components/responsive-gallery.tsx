'use client';

import Gallery from 'components/gallery';
import type { GalleryProps } from 'components/gallery';
import useMediaQuery from 'hooks/media-query';
import type { FC } from 'react';

const Page: FC<GalleryProps> = ({ ...props }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return <Gallery {...props} numColumns={isDesktop ? 4 : 2} />;
};

export default Page;
