import styles from 'components/navigation/component.module.css';
import ScrollTrigger from 'gsap/ScrollTrigger';

class ScrollObserver {
  private static instance: Observer | undefined;

  public static create(): Observer | undefined {
    if (!ScrollObserver.instance) {
      ScrollObserver.instance = ScrollTrigger.normalizeScroll({
        target: '.' + styles.content,
        wheelSpeed: 0.25,
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
