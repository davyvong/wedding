'use client';

import classNames from 'classnames';
import Gallery from 'components/gallery';
import SaveTheDate from 'components/save-the-date';
import galleryItems from 'constants/gallery-items.json';
import useTouchDevice from 'hooks/touch-device';
import type { FC } from 'react';

import styles from './page.module.css';

const Page: FC = () => {
  const isTouchDevice = useTouchDevice();

  return (
    <div className={classNames(styles.container, isTouchDevice && styles.containerTouch)}>
      <div className={classNames(styles.section, styles.saveTheDate, isTouchDevice && styles.saveTheDateTouch)}>
        <SaveTheDate />
      </div>
      <div className={styles.section}>
        <Gallery data={galleryItems} />
      </div>
    </div>
  );
};

export default Page;
