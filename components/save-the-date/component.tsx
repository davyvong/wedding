'use client';

import coverImageJPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import { useEffect } from 'react';
import type { FC } from 'react';
import { waitForElement } from 'utils/browser';

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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const setGSAPAnimations = () => {
      gsap.to('.' + styles.textMask, {
        overwrite: true,
        scrollTrigger: {
          invalidateOnRefresh: true,
          pin: true,
          scroller: document.querySelector('.' + navigationStyles.content),
          scrub: true,
          start: 'start start',
          trigger: '.' + styles.container,
        },
        flex: 1,
      });
    };
    waitForElement('.' + styles.textMask).then(setGSAPAnimations);
  }, []);

  const TextOverlay = (
    <div className={styles.textOverlay}>
      <div className={classNames(brittanySignatureFont.className, styles.saveTheDate)}>
        {t('components.save-the-date')}
      </div>
      <div className={classNames(playfairDislayFont.className, styles.names)}>
        {t('components.save-the-date.names')}
      </div>
      <div className={classNames(kollektifFont.className, styles.date)}>{t('components.save-the-date.date')}</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.textMask}>{TextOverlay}</div>
        <div className={styles.coverImageContainer}>
          <Image
            alt={t('components.save-the-date')}
            className={styles.coverImage}
            fill
            priority
            sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
            src={coverImageJPG}
          />
        </div>
        {TextOverlay}
      </div>
    </div>
  );
};

export default SaveTheDateComponent;
