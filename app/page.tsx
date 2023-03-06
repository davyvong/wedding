'use client';

// https://danmarshall.github.io/google-font-to-svg-path/

import SaveTheDateSVG from 'assets/images/save-the-date2.svg';
import Ticker from 'components/ticker';
import useTranslate from 'hooks/translate';
import Image from 'next/image';
import { Fragment, useMemo } from 'react';
import type { FC } from 'react';

import styles from './page.module.css';

const Page: FC = () => {
  const t = useTranslate();

  const detailsTicker = useMemo(
    () => [
      { key: 'date', style: { fontWeight: '600' }, text: t('components.ticker.details.date') },
      { key: 'location', text: t('components.ticker.details.location') },
    ],
    [t],
  );

  return (
    <Fragment>
      <div className={styles.hero}>
        <div className={styles.saveTheDate}>
          <SaveTheDateSVG />
        </div>
        <Ticker data={detailsTicker} />
        <div className={styles.cover}>
          <figure className={styles.figure}>
            <Image
              alt=""
              className={styles.image}
              fill
              priority
              src="https://collidephotography.ca/wp-content/uploads/2022/06/Toronto_wedding_photographer-3-scaled.jpg"
            />
          </figure>
        </div>
      </div>
    </Fragment>
  );
};

export default Page;
