import { StaticImageData } from 'next/image';
import { CSSProperties } from 'react';

export interface HorizontalPhotoStripImage {
  alt: string;
  src: StaticImageData;
  style?: CSSProperties;
}
