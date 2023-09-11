'use client';

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
      smooth: 1,
      wrapper: '.' + styles.smoothWrapper,
    });
  }

  public static pause(): void {
    Scroll.getInstance()?.paused(true);
  }

  public static unpause(): void {
    Scroll.getInstance()?.paused(false);
  }

  public static kill(): void {
    Scroll.getInstance()?.kill();
  }
}
