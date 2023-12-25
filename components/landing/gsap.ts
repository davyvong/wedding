'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import styles from './component.module.css';

export enum LandingBreakpoints {
  Mobile,
  Tablet,
  Desktop,
}

const getSpacing = (breakpoint: LandingBreakpoints): string => {
  switch (breakpoint) {
    case LandingBreakpoints.Mobile: {
      return '2rem';
    }
    case LandingBreakpoints.Tablet: {
      return '3rem';
    }
    case LandingBreakpoints.Desktop: {
      return '4rem';
    }
    default: {
      return '2rem';
    }
  }
};

export const createLandingContext = (breakpoint: LandingBreakpoints): gsap.Context =>
  gsap.context(() => {
    const firstSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        invalidateOnRefresh: true,
        pin: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: 'top 80px',
        trigger: '.' + styles.firstSection,
      },
    });
    firstSectionTimeline.to(
      '.' + styles.firstSection,
      {
        paddingLeft: getSpacing(breakpoint),
        paddingRight: getSpacing(breakpoint),
      },
      'zoomCoverImage',
    );
    firstSectionTimeline.to(
      '.' + styles.coverImage,
      {
        borderRadius: '1rem',
        height: `calc(100vh - 80px - ${getSpacing(breakpoint)})`,
      },
      'zoomCoverImage',
    );
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        invalidateOnRefresh: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: 'top center',
        trigger: '.' + styles.secondSection,
      },
    });
    secondSectionTimeline.fromTo(
      '.' + styles.backgroundStroke + ' path',
      {
        strokeDashoffset: 40626,
      },
      {
        strokeDashoffset: (index: number, backgroundStroke: Element) => {
          const section = backgroundStroke.parentNode?.parentNode as Element;
          return 40626 - section.clientHeight;
        },
      },
    );
    const thirdSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        end: (self: ScrollTrigger) => {
          const engagementPhotoSet = self.trigger?.firstChild as HTMLElement;
          return 'bottom +=' + (window.innerWidth - engagementPhotoSet.clientWidth);
        },
        invalidateOnRefresh: true,
        pin: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: '50% 50%',
        trigger: '.' + styles.thirdSection,
      },
    });
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      thirdSectionTimeline.to('.' + styles.engagementPhoto, {
        duration: 1,
        transform: 'translateY(0)',
      });
    }
    thirdSectionTimeline.to('.' + styles.engagementPhotoSet, {
      duration: 5,
      transform: 'translateX(calc(100vw - 100%))',
    });
    // if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
    //   thirdSectionTimeline.to('.' + styles.engagementPhoto, {
    //     duration: 1,
    //     transform: (index: number, engagementPhoto: Element, photosInHorizontalStrip: Element[]) => {
    //       return `translateY(calc(${photosInHorizontalStrip.length - 1 - index} * -20%))`;
    //     },
    //   });
    // }
    ScrollTrigger.refresh();
  });
