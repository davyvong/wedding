'use client';

import BackgroundStrokeSVG from 'assets/images/background-stroke.svg';
import VD72JPG from 'assets/images/VD-72.jpg';
import classNames from 'classnames';
import { brittanySignature, italiana, kollektif, openSans } from 'client/fonts';
import Translate from 'client/translate';
import gsap from 'gsap';
import Image from 'next/image';
import { FC, Fragment, useCallback, useEffect } from 'react';

import styles from './component.module.css';
import { CoupleQuestion, EngagementPhoto, coupleQuestions, engagementPhotos } from './constants';
import { LandingBreakpoints, createLandingContext } from './gsap';

const LandingComponent: FC = () => {
  useEffect(() => {
    let context: gsap.Context;
    gsap
      .matchMedia()
      .add('(max-width: 767px)', () => {
        context = createLandingContext(LandingBreakpoints.Mobile);
      })
      .add('(min-width: 768px) and (max-width: 1023px)', () => {
        context = createLandingContext(LandingBreakpoints.Tablet);
      })
      .add('(min-width: 1024px)', () => {
        context = createLandingContext(LandingBreakpoints.Desktop);
      });
    return () => {
      context?.revert();
    };
  }, []);

  const renderEngagementPhoto = useCallback(
    (image: EngagementPhoto): JSX.Element => (
      <div className={styles.engagementPhoto} key={image.id}>
        <div className={styles.engagementPhotoZoom}>
          <Image
            alt={Translate.t('components.landing.event-info.bride-and-groom')}
            fill
            priority
            quality={90}
            sizes="(max-width: 425px) 300vw, (max-width: 768px) 150vw, (max-width: 1024px) 50vw, (max-width: 1280px) 50vw, (max-width: 1440px) 50vw, (max-width: 2560px) 50vw, 50vw"
            src={image.src}
            style={image.style}
          />
        </div>
      </div>
    ),
    [],
  );

  const renderCoupleQuestion = useCallback(
    (coupleQuestion: CoupleQuestion, index: number): JSX.Element => (
      <Fragment key={coupleQuestion.question + index}>
        <div className={classNames(styles.coupleQuestion, openSans.className)}>
          {Translate.t(coupleQuestion.question)}
        </div>
        <div className={classNames(styles.coupleAnswer, openSans.className)}>
          {Translate.html(coupleQuestion.answer)}
        </div>
      </Fragment>
    ),
    [],
  );

  return (
    <div className={styles.landing}>
      <div className={styles.firstSection}>
        <div className={styles.coverImage}>
          <Image
            alt={Translate.t('components.landing.event-info.bride-and-groom')}
            fill
            priority
            quality={90}
            src={VD72JPG}
            sizes="(max-width: 425px) 200vw, (max-width: 768px) 200vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, (max-width: 1440px) 100vw, (max-width: 2560px) 100vw, 100vw"
          />
          <div className={styles.eventInfo}>
            <div className={classNames(styles.saveTheDate, brittanySignature.className)}>
              {Translate.t('components.landing.event-info.save-the-date')}
            </div>
            <div className={classNames(styles.brideAndGroom, italiana.className)}>
              {Translate.t('components.landing.event-info.bride-and-groom')}
            </div>
            <div className={classNames(styles.eventDate, kollektif.className)}>
              {Translate.t('components.landing.event-info.event-date')}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.secondSection}>
        <BackgroundStrokeSVG className={styles.backgroundStroke} />
        <div className={styles.coupleQuestionAnswerSection}>
          <div className={styles.coupleQuestionAnswerTitle}>Questions & Answers</div>
          {coupleQuestions.map(renderCoupleQuestion)}
        </div>
      </div>
      <div className={styles.thirdSection}>
        <div className={styles.engagementPhotoSet}>{engagementPhotos.map(renderEngagementPhoto)}</div>
      </div>
    </div>
  );
};

export default LandingComponent;
