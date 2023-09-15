'use client';

import navigationBarStyles from 'components/navigation-bar/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import styles from './scroll.module.css';

export class Scroll {
  public static getInstance(): ScrollSmoother | undefined {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    return ScrollSmoother.get();
  }

  public static create(): ScrollSmoother {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    const instance = Scroll.getInstance();
    if (instance) {
      return instance;
    }
    return ScrollSmoother.create({
      content: '.' + styles.smoothContent,
      ignoreMobileResize: true,
      normalizeScroll: true,
      onUpdate: (self: ScrollSmoother): void => {
        const navigationBar = document.querySelector('.' + navigationBarStyles.navigationBar);
        const velocity = self.getVelocity();
        if (navigationBar && velocity) {
          if (velocity > 0) {
            navigationBar.classList.add(navigationBarStyles.navigationBarHidden);
          }
          if (velocity < 0) {
            navigationBar.classList.remove(navigationBarStyles.navigationBarHidden);
          }
        }
      },
      smooth: 1,
      wrapper: '.' + styles.smoothWrapper,
    });
  }

  public static kill(): void {
    Scroll.getInstance()?.kill();
  }
}
