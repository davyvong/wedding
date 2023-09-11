'use client';

import VD72JPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import { brittanySignature, kollektif, playfairDisplay } from 'client/fonts';
import { Scroll } from 'client/scroll';
import scrollStyles from 'client/scroll.module.css';
import Translate from 'client/translate';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { FC, useCallback, useEffect } from 'react';

import styles from './component.module.css';
import { HorizontalPhotoStripImage, horizontalPhotoStripImageList } from './constants';
import { LandingBreakpoints, createLandingContext } from './gsap';

const LandingComponent: FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    Scroll.create();
    let context: gsap.Context;
    gsap
      .matchMedia()
      .add('(max-width: 767px)', () => {
        context = createLandingContext(LandingBreakpoints.Mobile);
      })
      .add('(min-width: 768px)', () => {
        context = createLandingContext(LandingBreakpoints.Tablet);
      });
    return () => {
      Scroll.kill();
      context?.revert();
    };
  }, []);

  const renderImageInPhotoStrip = useCallback(
    (image: HorizontalPhotoStripImage): JSX.Element => (
      <div className={styles.photoInHorizontalStrip} key={image.alt}>
        <div className={styles.photoInHorizontalStripZoom}>
          <Image
            alt={image.alt}
            fill
            priority
            quality={100}
            sizes="(max-width: 425px) 70vh, (max-width: 768px) 70vh, (max-width: 1024px) 70vh, (max-width: 1280px) 70vh, (max-width: 1440px) 70vh, 70vh"
            src={image.src}
            style={image.style}
          />
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className={scrollStyles.smoothWrapper}>
      <div className={scrollStyles.smoothContent}>
        <div className={styles.firstSection}>
          <div className={styles.coverImage}>
            <Image
              alt={Translate.t('components.landing.event-info.bride-and-groom')}
              fill
              priority
              quality={100}
              src={VD72JPG}
              sizes="(max-width: 425px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, 100vw"
            />
            <div className={styles.eventInfo}>
              <div className={classNames(styles.saveTheDate, brittanySignature.className)}>
                {Translate.t('components.landing.event-info.save-the-date')}
              </div>
              <div className={classNames(styles.brideAndGroom, playfairDisplay.className)}>
                {Translate.t('components.landing.event-info.bride-and-groom')}
              </div>
              <div className={classNames(styles.eventDate, kollektif.className)}>
                {Translate.t('components.landing.event-info.event-date')}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.secondSection}>
          <div className={styles.horizontalPhotoStrip}>
            {horizontalPhotoStripImageList.map(renderImageInPhotoStrip)}
          </div>
        </div>
        <div className={styles.thirdSection} />
      </div>
    </div>
  );
};

export default LandingComponent;
