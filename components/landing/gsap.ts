'use client';

import locomotiveScrollStyles from 'client/locomotive-scroll.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

import styles from './component.module.css';

export enum LandingBreakpoints {
  Mobile,
  Tablet,
  Desktop,
}

const getSpacing = (): string => {
  const computedStyles = window.getComputedStyle(document.documentElement);
  return computedStyles.getPropertyValue('--page-side-spacing');
};

export const createLandingContext = (breakpoint: LandingBreakpoints): gsap.Context =>
  gsap.context(() => {
    gsap.registerPlugin(ScrollTrigger);
    const locomotiveScroll = new LocomotiveScroll({
      draggingClass: locomotiveScrollStyles.hasScrollDragging,
      el: document.querySelector<HTMLElement>('.' + styles.landing),
      gestureDirection: 'vertical',
      initClass: locomotiveScrollStyles.hasScrollInit,
      reloadOnContextChange: true,
      repeat: true,
      scrollbarClass: locomotiveScrollStyles.scrollbar,
      scrollingClass: locomotiveScrollStyles.hasScrollScrolling,
      smartphone: {
        smooth: true,
      },
      smooth: true,
      smoothClass: locomotiveScrollStyles.hasScrollSmooth,
      tablet: {
        smooth: true,
      },
      touchMultiplier: 3,
    });
    ScrollTrigger.scrollerProxy('.' + styles.landing, {
      getBoundingClientRect() {
        const navigationBarHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--navigation-bar-height').replace('px', ''),
        );
        return {
          height: window.innerHeight - navigationBarHeight,
          left: 0,
          top: navigationBarHeight,
          width: window.innerWidth,
        };
      },
      scrollTop(value?: number): number | void {
        if (arguments.length) {
          locomotiveScroll.scrollTo(value, { disableLerp: true, duration: 0 });
        }
        return locomotiveScroll.scroll.instance.scroll.y;
      },
    });
    locomotiveScroll.on('scroll', (): void => {
      ScrollTrigger.update();
    });
    ScrollTrigger.addEventListener('refresh', () => {
      locomotiveScroll.update();
    });
    ScrollTrigger.defaults({
      scroller: '.' + styles.landing,
    });
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
        paddingLeft: getSpacing(),
        paddingRight: getSpacing(),
      },
      'zoomCoverImage',
    );
    firstSectionTimeline.to(
      '.' + styles.coverImage,
      {
        borderRadius: '1rem',
        height: `calc(100% - ${getSpacing()})`,
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
