'use client';

import coverImageJPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import type { FC } from 'react';
import { waitForElement } from 'utils/browser';

import CalendarLinks from './calendar-links';
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
      ScrollTrigger.normalizeScroll({
        target: '.' + navigationStyles.content,
      });
      const timeline = gsap.timeline({
        overwrite: true,
        scrollTrigger: {
          end: '+=200%',
          invalidateOnRefresh: true,
          pin: true,
          scroller: '.' + navigationStyles.content,
          scrub: true,
          start: 'start start',
          trigger: '.' + styles.container,
        },
      });
      timeline.to('.' + styles.textMask, { flex: 1 });
      timeline.addPause('+=1');
      timeline.add(() => {
        if (timeline.scrollTrigger?.direction === 1) {
          gsap.to('.' + styles.textOverlay, { bottom: '50%', translateY: '50%' });
          gsap.to('.' + styles.calendarRow, { autoAlpha: 1 });
        } else {
          gsap.to('.' + styles.textOverlay, { bottom: '3rem', translateY: '0' });
          gsap.to('.' + styles.calendarRow, { autoAlpha: 0 });
        }
      });
      timeline.addPause('+=1');
    };
    waitForElement('.' + styles.textMask).then(setGSAPAnimations);
    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  const renderTextOverlay = (): JSX.Element => (
    <div className={styles.textOverlay}>
      <div className={classNames(brittanySignatureFont.className, styles.saveTheDate)}>
        {t('components.save-the-date')}
      </div>
      <div className={classNames(playfairDislayFont.className, styles.names)}>
        {t('components.save-the-date.names')}
      </div>
      <div className={classNames(kollektifFont.className, styles.date)}>{t('components.save-the-date.date')}</div>
      <div className={styles.calendarRow}>
        <Link className={styles.calendarButton} href={CalendarLinks.getGoogle()} target="_blank">
          {t('components.save-the-date.calendar-links.google')}
        </Link>
        <Link className={styles.calendarButton} href={CalendarLinks.getOutlook()} target="_blank">
          {t('components.save-the-date.calendar-links.outlook')}
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.textMask}>{renderTextOverlay()}</div>
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
        {renderTextOverlay()}
      </div>
    </div>
  );
};

export default SaveTheDateComponent;
