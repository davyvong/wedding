'use client';

import classNames from 'classnames';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import { Fragment } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

const brittanySignatureFont = localFont({
  display: 'swap',
  src: '../../assets/fonts/brittany-signature.woff2',
});

const kollektifFont = localFont({
  display: 'swap',
  src: '../../assets/fonts/kollektif.woff2',
});

const playfairDislayFont = localFont({
  display: 'swap',
  src: '../../assets/fonts/playfair-display.woff2',
});

const SaveTheDateComponent: FC = () => {
  const { t } = useTranslate();

  return (
    <Fragment>
      <Image alt="" className={styles.imageBackdrop} fill src="/images/VD-72.jpg" />
      <div className={styles.textOverlay}>
        <div className={classNames(brittanySignatureFont.className, styles.saveTheDate)}>
          {t('components.save-the-date')}
        </div>
        <div className={classNames(playfairDislayFont.className, styles.names)}>
          {t('components.save-the-date.names')}
        </div>
        <div className={classNames(kollektifFont.className, styles.date)}>{t('components.save-the-date.date')}</div>
      </div>
    </Fragment>
  );
};

export default SaveTheDateComponent;
