import gsap from 'gsap';

import styles from './component.module.css';

export enum LandingBreakpoints {
  Mobile,
  Tablet,
  Desktop,
  Ultrawide,
}

export const createLandingContext = (breakpoint: LandingBreakpoints): gsap.Context =>
  gsap.context(() => {
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      const firstSectionTimeline = gsap.timeline({
        overwrite: true,
        scrollTrigger: {
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pin: true,
          scrub: 1,
          start: 'top top',
          trigger: '.' + styles.firstSection,
        },
      });
      firstSectionTimeline.to(
        '.' + styles.firstSection,
        {
          duration: 1,
          paddingBottom: '6vw',
          paddingLeft: '6vw',
          paddingRight: '6vw',
        },
        'zoomCoverImage',
      );
      firstSectionTimeline.to(
        '.' + styles.coverImage,
        {
          borderRadius: '2rem',
          duration: 1,
        },
        'zoomCoverImage',
      );
    }
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        anticipatePin: 1,
        end: '+300%',
        invalidateOnRefresh: true,
        pin: true,
        scrub: 1,
        start: 'top top',
        trigger: '.' + styles.secondSection,
      },
    });
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
        duration: 1,
        transform: 'translateY(0)',
      });
    }
    secondSectionTimeline.to('.' + styles.horizontalPhotoStrip, {
      duration: 5,
      transform: (index: number, horizontalPhotoStrip: Element) => {
        return `translateX(calc(100vw - ${horizontalPhotoStrip.clientWidth}px))`;
      },
    });
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
        duration: 1,
        transform: (index: number, photoInHorizontalStrip: Element, photosInHorizontalStrip: Element[]) => {
          return `translateY(calc(${photosInHorizontalStrip.length - 1 - index} * -20%))`;
        },
      });
    }
    gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        anticipatePin: 1,
        invalidateOnRefresh: true,
        pin: true,
        scrub: 1,
        start: 'top top',
        trigger: '.' + styles.thirdSection,
      },
    });
  });
