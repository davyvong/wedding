'use client';

import GoogleLogoSVG from 'assets/icons/google-logo.svg';
import OutlookLogoSVG from 'assets/icons/outlook-logo.svg';
import VD72JPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useTranslate from 'hooks/translate';
import localFont from 'next/font/local';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import type { FC } from 'react';
import { waitForElement } from 'utils/browser';

import CalendarLinks from './calendar-links';
import styles from './component.module.css';
import { horizontalPhotoStripImageList } from './constants';
import { StoryBreakpoints, createGSAPContext } from './gsap';
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
  const [isCoverImageLoaded, setIsCoverImageLoaded] = useState(false);

  useEffect(() => {
    if (isCoverImageLoaded) {
      let context: gsap.Context;
      let scrollObserver: Observer | undefined;
      waitForElement('.' + navigationStyles.content).then((content: Element): void => {
        gsap.registerPlugin(ScrollTrigger);
        scrollObserver = ScrollTrigger.normalizeScroll({
          target: content,
          wheelSpeed: 0.25,
        });
        gsap
          .matchMedia()
          .add('(max-width: 767px)', () => {
            context = createGSAPContext(StoryBreakpoints.Mobile, scrollObserver);
          })
          .add('(min-width: 768px) and (max-width: 1023px)', () => {
            context = createGSAPContext(StoryBreakpoints.Tablet, scrollObserver);
          })
          .add('(min-width: 1024px) and (max-width: 1679px)', () => {
            context = createGSAPContext(StoryBreakpoints.Desktop, scrollObserver);
          })
          .add('(min-width: 1680px)', () => {
            context = createGSAPContext(StoryBreakpoints.Ultrawide, scrollObserver);
          });
      });
      return () => {
        scrollObserver?.kill();
        context?.revert();
      };
    }
  }, [isCoverImageLoaded]);

  const renderImageInPhotoStrip = (image: HorizontalPhotoStripImage): JSX.Element => (
    <figure className={styles.photoInHorizontalStrip} key={image.alt}>
      <Image
        alt={image.alt}
        fill
        priority
        quality={100}
        sizes="(max-width: 425px) 70vh, (max-width: 768px) 70vh, (max-width: 1024px) 70vh, (max-width: 1280px) 70vh, (max-width: 1440px) 70vh, 70vh"
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
              onLoad={() => setIsCoverImageLoaded(true)}
              priority
              quality={100}
              sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
              src={VD72JPG}
            />
          </figure>
        </div>
        <div className={styles.eventInfoOverlay}>
          <div className={styles.eventInfo}>
            <div className={styles.eventInfoBackground} />
            <div className={classNames(styles.textWrapper, styles.saveTheDateTextWrapper)}>
              <div className={classNames(brittanySignatureFont.className, styles.eventSaveTheDate)}>
                {t('components.save-the-date')}
              </div>
            </div>
            <div className={styles.textWrapper}>
              <div className={classNames(playfairDislayFont.className, styles.eventCoupleNames)}>
                {t('components.save-the-date.names')}
              </div>
            </div>
            <div className={styles.textWrapper}>
              <div className={classNames(kollektifFont.className, styles.eventDate)}>
                {t('components.save-the-date.date')}
              </div>
            </div>
            <div className={styles.eventCalendar}>
              <a className={styles.eventCalendarButton} href={CalendarLinks.getGoogle()} target="_blank">
                <GoogleLogoSVG height="24" />
                <span>{t('components.save-the-date.calendar-links.google')}</span>
              </a>
              <a className={styles.eventCalendarButton} href={CalendarLinks.getOutlook()} target="_blank">
                <OutlookLogoSVG height="24" />
                <span>{t('components.save-the-date.calendar-links.outlook')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={classNames(styles.section, styles.secondSection)}>
        <div className={styles.horizontalPhotoStrip}>{horizontalPhotoStripImageList.map(renderImageInPhotoStrip)}</div>
      </div>
      <div className={classNames(styles.section, styles.thirdSection)} />
    </Fragment>
  );
};

export default StoryComponent;
