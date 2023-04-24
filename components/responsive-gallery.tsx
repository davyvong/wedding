'use client';

import { GalleryProps } from 'components/gallery';
import useMediaQuery from 'hooks/media-query';
import dynamic from 'next/dynamic';
import type { FC } from 'react';

const Gallery = dynamic(() => import('components/gallery'));

const Page: FC<GalleryProps> = ({ ...props }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return <Gallery {...props} numColumns={isDesktop ? 4 : 2} />;
};

export default Page;
