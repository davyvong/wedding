'use client';

import GoogleCalendarSVG from 'assets/icons/google-calendar.svg';
import OutlookCalendarSVG from 'assets/icons/outlook-calendar.svg';
import VD72JPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import { Fragment, useEffect } from 'react';
import type { FC } from 'react';
import smoothscroll from 'smoothscroll-polyfill';
import { waitForElement } from 'utils/browser';

import CalendarLinks from './calendar-links';
import styles from './component.module.css';
import { horizontalPhotoStripImageList } from './constants';
import { createGSAPContext } from './gsap';
import type { HorizontalPhotoStripImage } from './types';

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
    smoothscroll.polyfill();
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll({
      target: '.' + navigationStyles.content,
    });
    let context: gsap.Context;
    waitForElement('.' + styles.foregroundCard).then(() => {
      gsap
        .matchMedia()
        .add('(min-width: 768px) and (max-width: 1439px)', () => {
          context = createGSAPContext();
        })
        .add('(min-width: 1440px)', () => {
          context = createGSAPContext(true);
        });
    });
    return () => {
      ScrollTrigger.normalizeScroll(false);
      context?.revert();
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

  const renderImageInPhotoStrip = (image: HorizontalPhotoStripImage): JSX.Element => (
    <figure className={styles.photoInHorizontalStrip} key={image.alt}>
      <Image
        alt={image.alt}
        fill
        priority
        sizes="(max-width: 425px) 100vw, (max-width: 768px) 35vw, (max-width: 1024px) 35vw, (max-width: 1280px) 35vw, (max-width: 1440px) 35vw, 35vw"
        src={image.src}
        style={image.style}
      />
    </figure>
  );

  return (
    <Fragment>
      <div className={classNames(styles.section, styles.firstSection)}>
        <figure className={styles.coverImage}>
          <Image
            alt="VD72"
            fill
            priority
            sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
            src={VD72JPG}
          />
        </figure>
        <div className={styles.backgroundMask}>
          <div className={styles.backgroundCard}>{renderCard()}</div>
        </div>
        <div className={styles.foregroundCard}>{renderCard()}</div>
      </div>
      <div className={classNames(styles.section, styles.secondSection)}>
        <div className={styles.horizontalPhotoStrip}>{horizontalPhotoStripImageList.map(renderImageInPhotoStrip)}</div>
      </div>
    </Fragment>
  );
};

export default SaveTheDateComponent;
