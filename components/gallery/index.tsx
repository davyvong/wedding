import anime from 'animejs';
import pageStyles from 'app/page.module.css';
import useMediaQuery from 'hooks/media-query';
import useNavigation from 'hooks/navigation';
import useTouchDevice from 'hooks/touch-device';
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
}

const Gallery: FC<GalleryProps> = ({ data = [], numColumns = 2 }) => {
  const isTouchDevice = useTouchDevice();
  const isLaptopWidth = useMediaQuery('(min-width: 1024px)');
  const navigation = useNavigation();

  const animationRef = useRef<anime.AnimeInstance>();
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const playTimeoutRef = useRef<NodeJS.Timeout>();

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
    if (isTouchDevice || !isLaptopWidth) {
      clearTimeout(resizeTimeoutRef.current);
      clearTimeout(playTimeoutRef.current);
      anime.remove('.' + styles.column);
      const columns: NodeListOf<HTMLElement> = document.querySelectorAll('.' + styles.column);
      for (const column of columns) {
        column.style.transform = '';
      }
      const page = document.querySelector('.' + pageStyles.container);
      if (page) {
        page.scrollTop = 0;
      }
      if (animationRef.current) {
        animationRef.current = undefined;
      }
      return () => {};
    }
    if (!animationRef.current) {
      const page = document.querySelector('.' + pageStyles.container);
      if (page) {
        page.scrollTop = 0;
      }
      const container = document.querySelector('.' + styles.container);
      if (!container) {
        return;
      }
      animationRef.current = anime({
        autoplay: false,
        complete: (): void => {
          if (animationRef.current) {
            animationRef.current.completed = false;
          }
        },
        duration: (): number => {
          const translateY = window.innerHeight - container.clientHeight + 1;
          return (translateY / 30) * -1000;
        },
        easing: 'linear',
        loop: false,
        targets: '.' + styles.column,
        translateY: (element: Element): number[] => [0, window.innerHeight - element.clientHeight + 1],
      });
      animationRef.current.play();
    }
    const onResize = (): void => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const container = document.querySelector('.' + styles.container);
        if (!animationRef.current || !container) {
          return;
        }
        const { paused, progress } = animationRef.current;
        if (!paused) {
          animationRef.current.pause();
        }
        anime.remove('.' + styles.column);
        animationRef.current = anime({
          autoplay: false,
          complete: () => {
            if (animationRef.current) {
              animationRef.current.completed = false;
            }
          },
          duration: (): number => {
            const translateY = window.innerHeight - container.clientHeight + 1;
            return (translateY / 30) * -1000;
          },
          easing: 'linear',
          loop: false,
          targets: '.' + styles.column,
          translateY: (element: Element): number[] => [0, window.innerHeight - element.clientHeight + 1],
        });
        animationRef.current.seek((progress / 100) * animationRef.current.duration);
        if (!paused) {
          animationRef.current.play();
        }
      }, 500);
    };
    window.addEventListener('resize', onResize);
    return (): void => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [isLaptopWidth, isTouchDevice]);

  useEffect(() => {
    clearTimeout(playTimeoutRef.current);
    if (isTouchDevice || !isLaptopWidth) {
      clearTimeout(resizeTimeoutRef.current);
      anime.remove('.' + styles.column);
      if (animationRef.current) {
        animationRef.current = undefined;
      }
      return (): void => {};
    }
    if (animationRef.current) {
      if (navigation.isOpen) {
        animationRef.current.pause();
      } else if (animationRef.current.progress < 100) {
        playTimeoutRef.current = setTimeout(animationRef.current.play, 3000);
      }
    }
    const onWheel = (event: WheelEvent): void => {
      clearTimeout(playTimeoutRef.current);
      const container = document.querySelector('.' + styles.container);
      if (!animationRef.current || !container) {
        return;
      }
      animationRef.current.pause();
      const translateY = window.innerHeight - container.clientHeight + 1;
      const durationDelta = (event.deltaY / Math.abs(translateY)) * animationRef.current.duration;
      let nextDuration = animationRef.current.currentTime + durationDelta;
      nextDuration = Math.max(0, Math.min(animationRef.current.duration, nextDuration));
      animationRef.current.seek(nextDuration);
      if (animationRef.current.progress < 100) {
        playTimeoutRef.current = setTimeout(animationRef.current.play, 3000);
      }
    };
    if (!navigation.isOpen) {
      window.addEventListener('wheel', onWheel);
    }
    return () => {
      if (!navigation.isOpen) {
        window.removeEventListener('wheel', onWheel);
      }
      clearTimeout(playTimeoutRef.current);
    };
  }, [isLaptopWidth, isTouchDevice, navigation.isOpen]);

  return <GalleryComponent data={dataInColumns} />;
};

export default Gallery;
