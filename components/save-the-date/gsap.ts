import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';

import styles from './component.module.css';

export const createGSAPContext = (isMaxBreakpoint: boolean = false): gsap.Context =>
  gsap.context(() => {
    const firstSectionTimeline = gsap.timeline({
      onComplete: () => {
        const content = document.querySelector('.' + navigationStyles.content);
        if (content) {
          content.classList.remove(navigationStyles.contentScrollLocked);
        }
      },
      onStart: () => {
        const content = document.querySelector('.' + navigationStyles.content);
        if (content) {
          content.classList.add(navigationStyles.contentScrollLocked);
        }
      },
      overwrite: true,
      scrollTrigger: {
        once: true,
        invalidateOnRefresh: true,
        scroller: '.' + navigationStyles.content,
        start: 'top bottom',
        trigger: '.' + styles.firstSection,
      },
    });
    firstSectionTimeline.to('.' + styles.firstSection, {
      duration: 1,
    });
    firstSectionTimeline.to(
      '.' + styles.firstSection,
      {
        duration: 1,
        paddingLeft: '50%',
      },
      'shiftToRight',
    );
    firstSectionTimeline.to(
      '.' + styles.backgroundMask,
      {
        duration: 1,
        right: '50%',
      },
      'shiftToRight',
    );
    firstSectionTimeline.to(
      '.' + styles.coverImageSpacer,
      {
        duration: 1,
        padding: '2rem',
      },
      'shiftToRight',
    );
    firstSectionTimeline.to('.' + styles.cardContainer, {
      bottom: '50%',
      left: '50%',
      translateX: '-50%',
      translateY: '50%',
    });
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        anticipatePin: 1,
        end: '+=100%',
        invalidateOnRefresh: true,
        pin: true,
        preventOverlaps: true,
        scroller: '.' + navigationStyles.content,
        scrub: 1,
        start: 'top top',
        trigger: '.' + styles.secondSection,
      },
    });
    secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
      duration: 1,
      transform: 'translateY(0)',
    });
    secondSectionTimeline.to(
      '.' + styles.photoInHorizontalStrip,
      {
        duration: 3,
      },
      'shrinkAndScroll',
    );
    secondSectionTimeline.to(
      '.' + styles.horizontalPhotoStrip,
      {
        duration: 3,
        transform: (index: number, horizontalPhotoStrip: Element) => {
          return `translateX(calc(${isMaxBreakpoint ? '1680px' : '100vw'} - ${horizontalPhotoStrip.clientWidth}px))`;
        },
      },
      'shrinkAndScroll',
    );
    secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
      duration: 1,
      transform: (index: number, photoInHorizontalStrip: Element, photosInHorizontalStrip: Element[]) => {
        return `translateY(${photosInHorizontalStrip.length - 1 - index} * 20%)`;
      },
    });
  });
