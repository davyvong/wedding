import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';

import styles from './component.module.css';

export const createGSAPContext = (isMaxBreakpoint: boolean = false): gsap.Context =>
  gsap.context(() => {
    const firstSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        once: true,
        invalidateOnRefresh: true,
        scroller: '.' + navigationStyles.content,
        start: 'top bottom',
        trigger: '.' + styles.firstSection,
      },
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
        maxWidth: () => (isMaxBreakpoint ? '403.2px' : '28vw'),
        minWidth: () => (isMaxBreakpoint ? '403.2px' : '28vw'),
      },
      'shrinkAndScroll',
    );
    secondSectionTimeline.to(
      '.' + styles.horizontalPhotoStrip,
      {
        duration: 3,
        transform: () => (isMaxBreakpoint ? 'translateX(calc(-338px - 12rem))' : 'translateX(calc(-40vw - 12rem))'),
      },
      'shrinkAndScroll',
    );
  });
