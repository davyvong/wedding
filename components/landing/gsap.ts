'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
          invalidateOnRefresh: true,
          pin: true,
          scroller: '.' + styles.landing,
          scrub: true,
          start: 'top top',
          trigger: '.' + styles.firstSection,
        },
      });
      firstSectionTimeline.to(
        '.' + styles.firstSection,
        {
          paddingBottom: '6vw',
          paddingLeft: '6vw',
          paddingRight: '6vw',
        },
        'zoomCoverImage',
      );
      firstSectionTimeline.to('.' + styles.coverImage, { borderRadius: '2rem' }, 'zoomCoverImage');
    }
    const secondSectionTimeline = gsap.timeline({
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
        start: 'top top',
        trigger: '.' + styles.secondSection,
      },
    });
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      secondSectionTimeline.to('.' + styles.engagementPhoto, {
        duration: 1,
        transform: 'translateY(0)',
      });
    }
    secondSectionTimeline.to('.' + styles.engagementPhotoSet, {
      duration: 5,
      transform: (index: number, engagementPhotoSet: Element) => {
        return `translateX(calc(100vw - ${engagementPhotoSet.clientWidth}px))`;
      },
    });
    if (breakpoint.valueOf() >= LandingBreakpoints.Tablet.valueOf()) {
      secondSectionTimeline.to('.' + styles.engagementPhoto, {
        duration: 1,
        transform: (index: number, engagementPhoto: Element, photosInHorizontalStrip: Element[]) => {
          return `translateY(calc(${photosInHorizontalStrip.length - 1 - index} * -20%))`;
        },
      });
    }
    const thirdSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        invalidateOnRefresh: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: 'top 200px',
        trigger: '.' + styles.thirdSection,
      },
    });
    thirdSectionTimeline.fromTo(
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
    ScrollTrigger.refresh();
  });
