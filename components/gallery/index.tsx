import anime from 'animejs';
import pageStyles from 'app/page.module.css';
import useIsTouchDevice from 'hooks/is-touch-device';
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
}

const Gallery: FC<GalleryProps> = props => {
  const { data = [] } = props;

  const isTouchDevice = useIsTouchDevice();
  const isLaptopWidth = useMediaQuery('(min-width: 1024px)');
  const navigation = useNavigation();

  const animationRef = useRef<anime.AnimeInstance>();
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const playTimeoutRef = useRef<NodeJS.Timeout>();
  const translateY = useRef<number>();

  const dataInColumns = useMemo((): GalleryItem[][] => {
    const groups: GalleryItem[][] = [];
    for (let i = 0; i < data.length; i++) {
      const column = i % 2;
      if (!Array.isArray(groups[column])) {
        groups[column] = [];
      }
      const datum = { ...data[i] };
      if (groups[column].length < 2) {
        datum.priority = true;
      }
      groups[column].push(datum);
    }
    return groups;
  }, [data]);

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
      translateY.current = window.innerHeight - container.clientHeight + 1;
      animationRef.current = anime({
        autoplay: false,
        complete: (): void => {
          if (animationRef.current) {
            animationRef.current.completed = false;
          }
        },
        duration: (translateY.current / 30) * -1000,
        easing: 'linear',
        loop: false,
        targets: '.' + styles.column,
        translateY: [0, translateY.current],
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
        translateY.current = window.innerHeight - container.clientHeight + 1;
        anime.remove('.' + styles.column);
        animationRef.current = anime({
          autoplay: false,
          complete: () => {
            if (animationRef.current) {
              animationRef.current.completed = false;
            }
          },
          duration: (translateY.current / 30) * -1000,
          easing: 'linear',
          loop: false,
          targets: '.' + styles.column,
          translateY: [0, translateY.current],
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
      if (!animationRef.current || !translateY.current) {
        return;
      }
      animationRef.current.pause();
      const deltaDuration = (event.deltaY / Math.abs(translateY.current)) * animationRef.current.duration;
      let nextDuration = animationRef.current.currentTime + deltaDuration;
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

  return <GalleryComponent {...props} data={dataInColumns} />;
};

export default Gallery;
