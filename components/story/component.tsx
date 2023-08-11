'use client';

import GoogleLogoSVG from 'assets/icons/google-logo.svg';
import OutlookLogoSVG from 'assets/icons/outlook-logo.svg';
import VD72JPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import { Fragment, useEffect } from 'react';
import type { FC } from 'react';
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

const StoryComponent: FC = () => {
  const { t } = useTranslate();

  useEffect(() => {
    let context: gsap.Context;
    waitForElement('.' + styles.foregroundCard).then(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap
        .matchMedia()
        .add('(min-width: 768px) and (max-width: 1679px)', () => {
          context = createGSAPContext();
        })
        .add('(min-width: 1680px)', () => {
          context = createGSAPContext(true);
        });
    });
    return () => {
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
          <GoogleLogoSVG height="24" />
          <span>{t('components.save-the-date.calendar-links.google')}</span>
        </a>
        <a className={styles.calendarButton} href={CalendarLinks.getOutlook()} target="_blank">
          <OutlookLogoSVG height="24" />
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
        <div className={styles.coverImageSpacer}>
          <figure className={styles.coverImage}>
            <Image
              alt="VD72"
              fill
              priority
              sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
              src={VD72JPG}
            />
          </figure>
        </div>
        <div className={styles.backgroundMask}>
          <div className={styles.backgroundCard}>{renderCard()}</div>
        </div>
        <div className={styles.foregroundCard}>{renderCard()}</div>
      </div>
      <div className={classNames(styles.section, styles.secondSection)}>
        <div className={styles.horizontalPhotoStrip}>{horizontalPhotoStripImageList.map(renderImageInPhotoStrip)}</div>
      </div>
      <div className={classNames(styles.section, styles.thirdSection)} />
    </Fragment>
  );
};

export default StoryComponent;
