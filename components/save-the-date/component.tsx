'use client';

import GoogleCalendarSVG from 'assets/icons/google-calendar.svg';
import OutlookCalendarSVG from 'assets/icons/outlook-calendar.svg';
import CoverImageJPG from 'assets/images/VD-72.jpg';
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
    waitForElement('.' + styles.foregroundCard).then(() => {
      const matchMedia = gsap.matchMedia();
      matchMedia.add('(min-width: 768px)', () => {
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
        timeline.to('.' + styles.backgroundCard, { flex: 1 });
        timeline.addPause('>0.1');
        timeline.add(() => {
          if (timeline.scrollTrigger?.direction === 1) {
            gsap.to('.' + styles.cardContainer, {
              bottom: '50%',
              left: '50%',
              translateX: '-50%',
              translateY: '50%',
            });
          } else {
            gsap.to('.' + styles.cardContainer, {
              bottom: '3rem',
              left: '3rem',
              translateX: '0',
              translateY: '0',
            });
          }
        });
        timeline.addPause('>0.1');
      });
    });
    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  const renderCard = (): JSX.Element => (
    <div className={styles.cardContainer}>
      <div className={classNames(brittanySignatureFont.className, styles.saveTheDate)}>
        {t('components.save-the-date')}
      </div>
      <div className={classNames(playfairDislayFont.className, styles.names)}>
        {t('components.save-the-date.names')}
      </div>
      <div className={classNames(kollektifFont.className, styles.date)}>{t('components.save-the-date.date')}</div>
      <div className={styles.calendarRow}>
        <a className={styles.calendarButton} href={CalendarLinks.getGoogle()} target="_blank">
          <GoogleCalendarSVG height="24" />
          <span>{t('components.save-the-date.calendar-links.google')}</span>
        </a>
        <a className={styles.calendarButton} href={CalendarLinks.getOutlook()} target="_blank">
          <OutlookCalendarSVG height="30" />
          <span>{t('components.save-the-date.calendar-links.outlook')}</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.coverImageContainer}>
          <Image
            alt={t('components.save-the-date')}
            className={styles.coverImage}
            fill
            priority
            sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
            src={CoverImageJPG}
          />
        </div>
        <div className={styles.backgroundCard}>{renderCard()}</div>
        <div className={styles.foregroundCard}>{renderCard()}</div>
      </div>
    </div>
  );
};

export default SaveTheDateComponent;
