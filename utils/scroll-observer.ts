import styles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

class ScrollObserver {
  private static instance: Observer | undefined;

  public static create(): Observer | undefined {
    if (!ScrollObserver.instance) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollObserver.instance = ScrollTrigger.normalizeScroll({
        target: '.' + styles.content,
        wheelSpeed: 0.6,
      });
    }
    return ScrollObserver.instance;
  }

  public static enable(): void {
    ScrollObserver.instance?.enable();
  }

  public static disable(): void {
    ScrollObserver.instance?.disable();
  }

  public static kill(): void {
    ScrollObserver.instance?.kill();
    ScrollObserver.instance = undefined;
  }
}

export default ScrollObserver;
