import Image from 'next/image';
import { useCallback } from 'react';
import type { FC, ReactNode } from 'react';

import styles from './component.module.css';
import type { GalleryItem } from './index';

interface GalleryComponentProps {
  data: GalleryItem[][];
}

const GalleryComponent: FC<GalleryComponentProps> = props => {
  const { data = [], ...containerProps } = props;

  const renderItem = useCallback(
    ({ aspectRatio, image, priority, subtitle, title, ...cardProps }: GalleryItem, index: number): ReactNode => {
      const style = {
        paddingTop: aspectRatio * 100 + '%',
      };
      return (
        <div {...cardProps} className={styles.card} key={index} style={style}>
          <Image
            alt={image}
            fill
            key={index}
            priority={priority}
            quality={80}
            sizes="(max-width: 448px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 50vw, (max-width: 1440px) 50vw, 50vw"
            src={image}
            style={{ objectFit: 'cover' }}
          />
          {(subtitle || title) && (
            <div className={styles.body}>
              {title && <div className={styles.title}>{title}</div>}
              {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
          )}
        </div>
      );
    },
    [],
  );

  const renderColumn = useCallback(
    (items: GalleryItem[], index: number): ReactNode => (
      <div className={styles.column} key={index}>
        {items.map(renderItem)}
      </div>
    ),
    [renderItem],
  );

  return (
    <div {...containerProps} className={styles.container}>
      {data.map(renderColumn)}
    </div>
  );
};

export default GalleryComponent;
