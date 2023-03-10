import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';

import GalleryComponent from './component';
import styles from './component.module.css';

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
  const timelineRef = useRef<gsap.core.Timeline>();

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
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return <GalleryComponent data={dataInColumns} />;
};

export default Gallery;
