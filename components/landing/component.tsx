'use client';

import BackgroundStrokeSVG from 'assets/images/landing/background-stroke.svg';
import VD72JPG from 'assets/images/landing/VD-72.jpg';
import classNames from 'classnames';
import { waitForElement } from 'client/browser';
import { brittanySignature, italiana, kollektif } from 'client/fonts';
import Translate from 'client/translate';
import EventDetails from 'components/event-details';
import FrequentlyAskedQuestions from 'components/frequently-asked-questions';
import { navigateToFAQ } from 'components/mega-menu/component';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';
import { EngagementPhoto, engagementPhotos } from './constants';
import { createLandingContext } from './gsap';

export interface LandingComponentProps {
  token?: VerifiedGuestTokenPayload;
}

const LandingComponent: FC<LandingComponentProps> = ({ token }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo) {
      const url = new URL(window.location.href);
      url.searchParams.delete('scrollTo');
      window.history.pushState({ path: url.href }, '', url.href);
      waitForElement('#' + scrollTo, navigateToFAQ);
    }
  }, [searchParams]);

  useEffect(() => {
    const context: gsap.Context = createLandingContext();
    return () => {
      context.revert();
      window.locomotiveScroll?.destroy();
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
            sizes="(max-width: 640px) 200vw, (max-width: 750px) 150vw, (max-width: 828px) 150vw, (max-width: 1080px) 50vw, (max-width: 1200px) 50vw, (max-width: 1920px) 50vw, (max-width: 2048px) 50vw, (max-width: 3840px) 50vw, 50vw"
            src={image.src}
            style={image.style}
          />
        </div>
      </div>
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
            quality={80}
            src={VD72JPG}
            sizes="(max-width: 640px) 200vw, (max-width: 750px) 200vw, (max-width: 828px) 200vw, (max-width: 1080px) 100vw, (max-width: 1200px) 100vw, (max-width: 1920px) 100vw, (max-width: 2048px) 100vw, (max-width: 3840px) 100vw, 100vw"
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
        <EventDetails token={token} />
        <FrequentlyAskedQuestions token={token} />
      </div>
      <div className={styles.thirdSection}>
        <div className={styles.engagementPhotoSet}>{engagementPhotos.map(renderEngagementPhoto)}</div>
      </div>
    </div>
  );
};

export default LandingComponent;
