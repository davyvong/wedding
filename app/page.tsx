'use client';

import classNames from 'classnames';
import Gallery from 'components/gallery';
import Hero from 'components/hero';
import galleryItems from 'constants/gallery-items.json';
import useIsTouchDevice from 'hooks/is-touch-device';
import type { FC } from 'react';

import styles from './page.module.css';

const Page: FC = () => {
  const isTouchDevice = useIsTouchDevice();

  return (
    <div className={classNames(styles.container, isTouchDevice && styles.containerTouch)}>
      <div className={classNames(styles.section, styles.hero, isTouchDevice && styles.heroTouch)}>
        <Hero />
      </div>
      <div className={styles.section}>
        <Gallery data={galleryItems} />
      </div>
    </div>
  );
};

export default Page;
