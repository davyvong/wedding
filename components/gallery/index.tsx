import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useMediaQuery from 'hooks/media-query';
import { useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';

import GalleryComponent from './component';
import styles from './component.module.css';

gsap.registerPlugin(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

export interface GalleryItem {
  aspectRatio: number;
  image: string;
  priority?: boolean;
  subtitle?: string;
  title?: string;
}

interface GalleryProps {
  data: GalleryItem[];
  numColumns?: number;
}

const Gallery: FC<GalleryProps> = ({ data = [], numColumns = 2 }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const timelineRef = useRef<gsap.core.Timeline>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const dataInColumns = useMemo((): GalleryItem[][] => {
    const groups: GalleryItem[][] = [];
    const height: number[] = [];
    for (let i = 0; i < data.length; i++) {
      let column = i % numColumns;
      if (i >= numColumns) {
        column = height.indexOf(Math.min(...height));
      }
      if (!Array.isArray(groups[column])) {
        groups[column] = [];
        height[column] = 0;
      }
      const datum = { ...data[i] };
      if (groups[column].length < 2) {
        datum.priority = true;
      }
      groups[column].push(datum);
      height[column] += datum.aspectRatio;
    }
    return groups;
  }, [data, numColumns]);

  useEffect(() => {
    if (!isDesktop) {
      const tweens = gsap.getTweensOf('.' + navigationStyles.content);
      for (const tween of tweens) {
        tween.kill();
      }
      timelineRef.current?.seek(0);
    }
    timelineRef.current = gsap.timeline({
      scrollTrigger: {
        end: (): string => {
          const container = document.querySelector('.' + styles.container) as Element;
          return '+=' + (container.clientHeight - window.innerHeight - 1);
        },
        invalidateOnRefresh: true,
        scroller: document.querySelector('.' + navigationStyles.content),
        scrub: true,
        start: 'start start',
        trigger: '.' + styles.container,
      },
    });
    timelineRef.current.to('.' + styles.column, {
      y: (index: number, column: Element) => {
        const container = document.querySelector('.' + styles.container) as Element;
        return container.clientHeight - column.clientHeight;
      },
    });
    const setAutoScroll = () => {
      if (!isDesktop) {
        return;
      }
      gsap.to('.' + navigationStyles.content, {
        duration: () => {
          const content = document.querySelector('.' + navigationStyles.content) as Element;
          const container = document.querySelector('.' + styles.container) as Element;
          const progress = (container.clientHeight - content.scrollTop) / container.clientHeight;
          return 30 * progress;
        },
        ease: 'none',
        overwrite: true,
        scrollTo: {
          autoKill: true,
          y: 'max',
        },
      });
    };
    timeoutRef.current = setTimeout(setAutoScroll, 3000);
    const onScroll = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(setAutoScroll, 3000);
    };
    const content = document.querySelector('.' + navigationStyles.content);
    content?.addEventListener('scroll', onScroll);
    return () => {
      timelineRef.current?.kill();
      clearTimeout(timeoutRef.current);
      content?.removeEventListener('scroll', onScroll);
    };
  }, [isDesktop]);

  return <GalleryComponent data={dataInColumns} />;
};

export default Gallery;
