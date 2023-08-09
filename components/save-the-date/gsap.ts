import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';

import styles from './component.module.css';

export const createGSAPContext = (): gsap.Context =>
  gsap.context(() => {
    const firstSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        end: '+=400%',
        invalidateOnRefresh: true,
        pin: true,
        scroller: '.' + navigationStyles.content,
        scrub: true,
        start: 'top top',
        trigger: '.' + styles.firstSection,
      },
    });
    firstSectionTimeline.to('.' + styles.backgroundCard, {
      duration: 2,
      flex: 1,
    });
    firstSectionTimeline.add(() => {
      if (firstSectionTimeline.scrollTrigger?.direction === 1) {
        gsap.to('.' + styles.cardContainer, {
          bottom: '50%',
          left: '50%',
          translateX: '-50%',
          translateY: '50%',
        });
      } else {
        gsap.to('.' + styles.cardContainer, {
          bottom: '3rem',
          left: '3rem',
          translateX: '0',
          translateY: '0',
        });
      }
    });
    const secondSectionTimeline = gsap.timeline({
      overwrite: true,
      scrollTrigger: {
        end: '+=400%',
        invalidateOnRefresh: true,
        pin: true,
        scroller: '.' + navigationStyles.content,
        scrub: true,
        start: 'top top',
        trigger: '.' + styles.secondSection,
      },
    });
    secondSectionTimeline.to('.' + styles.photoInHorizontalStrip, {
      duration: 1,
      transform: 'translateY(0)',
    });
    secondSectionTimeline.to(
      '.' + styles.photoInHorizontalStrip,
      {
        duration: 3,
        maxWidth: '28vw',
        minWidth: '28vw',
      },
      'shrinkAndScroll',
    );
    secondSectionTimeline.to(
      '.' + styles.horizontalPhotoStrip,
      {
        duration: 3,
        transform: 'translateX(calc(-40vw - 12rem))',
      },
      'shrinkAndScroll',
    );
  });
