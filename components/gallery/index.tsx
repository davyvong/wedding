'use client';

import navigationStyles from 'components/navigation/component.module.css';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import useMediaQuery from 'hooks/media-query';
import useNavigation from 'hooks/navigation';
import { useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';

import GalleryComponent from './component';
import styles from './component.module.css';

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
  scrollDuration?: number;
}

const Gallery: FC<GalleryProps> = ({ data = [], numColumns = 2, scrollDuration = 30 }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const navigation = useNavigation();

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
    gsap.registerPlugin(ScrollTrigger);
    let context;
    const onResize = () => {
      context?.revert();
      setTimeout(() => {
        context = gsap.context((self: gsap.Context) => {
          if (!self.selector) {
            return;
          }
          const columns = self.selector('.' + styles.column);
          for (const column of columns) {
            gsap.to(column, {
              overwrite: true,
              scrollTrigger: {
                end: () => {
                  const container = document.querySelector('.' + styles.container) as Element;
                  return '+=' + (container.clientHeight - window.innerHeight);
                },
                invalidateOnRefresh: true,
                scroller: document.querySelector('.' + navigationStyles.content),
                scrub: true,
                start: 'start start',
                trigger: '.' + styles.container,
              },
              y: (index: number, column: Element) => {
                const container = document.querySelector('.' + styles.container) as Element;
                return container.clientHeight - column.clientHeight;
              },
            });
          }
        }, '.' + navigationStyles.content);
      }, 100);
    };
    onResize();
    window?.addEventListener('resize', onResize);
    return () => {
      context?.revert();
      window?.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    if (!isDesktop || navigation.isOpen) {
      const tweens = gsap.getTweensOf('.' + navigationStyles.content);
      for (const tween of tweens) {
        tween.kill();
      }
      clearTimeout(timeoutRef.current);
      return () => {};
    }
    const setAutoScroll = () => {
      gsap.to('.' + navigationStyles.content, {
        duration: () => {
          const content = document.querySelector('.' + navigationStyles.content) as Element;
          const scrollHeight = content.scrollHeight - window.innerHeight;
          const progress = (scrollHeight - content.scrollTop) / scrollHeight;
          return scrollDuration * progress;
        },
        ease: 'none',
        overwrite: true,
        scrollTo: {
          autoKill: true,
          y: 'max',
        },
      });
    };
    timeoutRef.current = setTimeout(setAutoScroll);
    const onScroll = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(setAutoScroll, 3000);
    };
    const content = document.querySelector('.' + navigationStyles.content);
    content?.addEventListener('scroll', onScroll);
    return () => {
      clearTimeout(timeoutRef.current);
      content?.removeEventListener('scroll', onScroll);
    };
  }, [isDesktop, navigation.isOpen, scrollDuration]);

  return <GalleryComponent data={dataInColumns} />;
};

export default Gallery;
