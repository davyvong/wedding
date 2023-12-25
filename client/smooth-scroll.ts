'use client';

// import navigationStyles from 'components/navigation-bar/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

import styles from './smooth-scroll.module.css';

declare global {
  interface Window {
    previousScrollY: number;
  }
}

class SmoothScroll {
  private static instance: LocomotiveScroll;

  public static create(scrollerSelector: string): LocomotiveScroll {
    gsap.registerPlugin(ScrollTrigger);
    const scroller = document.querySelector<HTMLElement>(scrollerSelector);
    SmoothScroll.instance = new LocomotiveScroll({
      draggingClass: styles.hasScrollDragging,
      el: scroller,
      gestureDirection: 'vertical',
      reloadOnContextChange: true,
      repeat: true,
      scrollbarClass: styles.scrollbar,
      smartphone: {
        smooth: true,
      },
      smooth: true,
      smoothClass: styles.hasScrollSmooth,
      tablet: {
        smooth: true,
      },
      touchMultiplier: 3,
    });
    window.scrollY = 0;
    SmoothScroll.instance.on('scroll', (event): void => {
      // const navigationBar = document.querySelector('.' + navigationStyles.navigationBar);
      // if (window.previousScrollY > event.scroll.y) {
      //   navigationBar?.classList.remove(navigationStyles.navigationBarHidden);
      // } else if (window.previousScrollY < event.scroll.y) {
      //   navigationBar?.classList.add(navigationStyles.navigationBarHidden);
      // }
      window.previousScrollY = event.scroll.y;
      ScrollTrigger.update();
    });
    ScrollTrigger.scrollerProxy(scroller, {
      getBoundingClientRect() {
        return {
          height: window.innerHeight,
          left: 0,
          top: 0,
          width: window.innerWidth,
        };
      },
      pinType: scroller?.style.transform ? 'transform' : 'fixed',
      scrollTop(value) {
        return arguments.length
          ? SmoothScroll.instance.scrollTo(value, { disableLerp: true, duration: 0 })
          : SmoothScroll.instance.scroll.instance.scroll.y;
      },
    });
    ScrollTrigger.addEventListener('refresh', () => {
      SmoothScroll.instance.update();
    });
    return SmoothScroll.instance;
  }

  public static destroy(): void {
    SmoothScroll.instance?.destroy();
  }
}

export default SmoothScroll;
