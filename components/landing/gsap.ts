'use client';

import { getStyleProperty } from 'client/browser';
import locomotiveScrollStyles from 'client/locomotive-scroll.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

import styles from './component.module.css';

export const createLocomotiveScroll = (): void => {
  window.locomotiveScroll?.destroy();
  window.locomotiveScroll = new LocomotiveScroll({
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
      breakpoint: 768,
      smooth: true,
    },
    touchMultiplier: 3,
  });
  ScrollTrigger.scrollerProxy('.' + styles.landing, {
    getBoundingClientRect() {
      const navigationBarHeight = parseInt(getStyleProperty('--navigation-bar-height').replace('px', ''));
      return {
        height: window.innerHeight - navigationBarHeight,
        left: 0,
        top: navigationBarHeight,
        width: window.innerWidth,
      };
    },
    scrollTop(value?: number): number | void {
      if (arguments.length) {
        window.locomotiveScroll.scrollTo(value, { disableLerp: true, duration: 0 });
      }
      return window.locomotiveScroll.scroll.instance.scroll.y;
    },
  });
  window.locomotiveScroll.on('scroll', (): void => {
    ScrollTrigger.update();
  });
  ScrollTrigger.addEventListener('matchMedia', () => {
    window.locomotiveScroll.update();
  });
  ScrollTrigger.addEventListener('refresh', () => {
    window.locomotiveScroll.update();
  });
  ScrollTrigger.defaults({
    scroller: '.' + styles.landing,
  });
};

export const createLandingContext = (): gsap.Context =>
  gsap.context(() => {
    gsap.registerPlugin(ScrollTrigger);
    createLocomotiveScroll();
    const firstSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        invalidateOnRefresh: true,
        pin: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: () => 'top top',
        trigger: '.' + styles.firstSection,
      },
    });
    firstSectionTimeline.fromTo(
      '.' + styles.firstSection,
      {
        paddingLeft: () => 0,
        paddingRight: () => 0,
      },
      {
        paddingLeft: () => getStyleProperty('--page-side-spacing'),
        paddingRight: () => getStyleProperty('--page-side-spacing'),
      },
      'zoomCoverImage',
    );
    firstSectionTimeline.fromTo(
      '.' + styles.coverImage,
      {
        borderRadius: () => 0,
        height: () => {
          return `calc(${window.innerHeight}px - ${getStyleProperty('--navigation-bar-height')})`;
        },
      },
      {
        borderRadius: () => '1rem',
        height: () => {
          return `calc(${window.innerHeight}px - ${getStyleProperty('--navigation-bar-height')} - ${getStyleProperty('--page-side-spacing')})`;
        },
      },
      'zoomCoverImage',
    );
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        invalidateOnRefresh: true,
        scroller: '.' + styles.landing,
        scrub: true,
        start: () => 'top center',
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
        start: () => '50% 50%',
        trigger: '.' + styles.thirdSection,
      },
    });
    gsap
      .matchMedia()
      .add('(max-width: 639px)', () => {
        thirdSectionTimeline.fromTo(
          '.' + styles.engagementPhotoSet,
          {
            duration: 5,
            transform: () => 'translateX(0)',
          },
          {
            duration: 5,
            transform: () => 'translateX(calc(100vw - 100%))',
          },
        );
      })
      .add('(min-width: 640px)', () => {
        thirdSectionTimeline.fromTo(
          '.' + styles.engagementPhoto,
          {
            duration: 1,
            transform: (index: number) => {
              return `translateY(${index * 20}%)`;
            },
          },
          {
            duration: 1,
            transform: () => 'translateY(0)',
          },
        );
        thirdSectionTimeline.fromTo(
          '.' + styles.engagementPhotoSet,
          {
            duration: 5,
            transform: () => 'translateX(0)',
          },
          {
            duration: 5,
            transform: () => 'translateX(calc(100vw - 100%))',
          },
        );
      });
    // thirdSectionTimeline.fromTo(
    //   '.' + styles.engagementPhoto,
    //   {
    //     duration: 1,
    //     transform: () => 'translateY(0)',
    //   },
    //   {
    //     duration: 1,
    //     transform: (index: number, engagementPhoto: Element, photosInHorizontalStrip: Element[]) => {
    //       return `translateY(calc(${photosInHorizontalStrip.length - 1 - index} * -20%))`;
    //     },
    //   },
    // );
    ScrollTrigger.refresh();
  });
