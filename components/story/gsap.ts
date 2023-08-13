import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';

import styles from './component.module.css';

export enum StoryBreakpoints {
  Mobile,
  Tablet,
  Desktop,
  Ultrawide,
}

export const createGSAPContext = (breakpoint: StoryBreakpoints): gsap.Context =>
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
    firstSectionTimeline.to('.' + styles.eventSaveTheDate, {
      duration: 0.75,
      translateY: 0,
    });
    firstSectionTimeline.to('.' + styles.eventCoupleNames, {
      duration: 0.75,
      translateY: 0,
    });
    firstSectionTimeline.to('.' + styles.eventDate, {
      duration: 0.75,
      translateY: 0,
    });
    firstSectionTimeline.to('.' + styles.firstSection, {
      duration: 0.5,
    });
    if (breakpoint === StoryBreakpoints.Desktop || breakpoint === StoryBreakpoints.Ultrawide) {
      firstSectionTimeline.to('.' + styles.eventInfoOverlay, {
        duration: 1,
        right: '60%',
      });
    }
    firstSectionTimeline.to(
      '.' + styles.coverImageSpacer,
      {
        duration: 1,
        opacity: 1,
        padding: breakpoint === StoryBreakpoints.Mobile ? 0 : '2rem',
      },
      'imageFadeIn',
    );
    firstSectionTimeline.to(
      '.' + styles.eventInfo,
      {
        color: '#ffffff',
        duration: 1,
      },
      'imageFadeIn',
    );
    firstSectionTimeline.to(
      '.' + styles.eventInfoBackground,
      {
        duration: 1,
        opacity: 0.35,
      },
      'imageFadeIn',
    );
    firstSectionTimeline.to(
      '.' + styles.eventCalendar,
      {
        duration: 1,
        opacity: 1,
      },
      'imageFadeIn',
    );
    firstSectionTimeline.to(
      '.' + styles.eventCalendarButton,
      {
        duration: 0.25,
        translateY: 0,
      },
      'imageFadeIn',
    );
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        anticipatePin: 1,
        end: '+=200%',
        invalidateOnRefresh: true,
        pin: true,
        preventOverlaps: true,
        scroller: '.' + navigationStyles.content,
        scrub: 1,
        start: 'top top',
        trigger: '.' + styles.secondSection,
      },
    });
    if (breakpoint === StoryBreakpoints.Desktop || breakpoint === StoryBreakpoints.Ultrawide) {
      secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
        duration: 1,
        transform: 'translateY(0)',
      });
    }
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
          const fullWidth = breakpoint === StoryBreakpoints.Ultrawide ? '1680px' : '100vw';
          return `translateX(calc(${fullWidth} - ${horizontalPhotoStrip.clientWidth}px))`;
        },
      },
      'shrinkAndScroll',
    );
    if (breakpoint === StoryBreakpoints.Desktop || breakpoint === StoryBreakpoints.Ultrawide) {
      secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
        duration: 1,
        transform: (index: number, photoInHorizontalStrip: Element, photosInHorizontalStrip: Element[]) => {
          return `translateY(calc(${photosInHorizontalStrip.length - 1 - index} * -20%))`;
        },
      });
    }
  });
