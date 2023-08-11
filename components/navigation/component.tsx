'use client';

import GScroll from '@grcmichael/gscroll';
import classNames from 'classnames';
import ClientEnvironment from 'client/environment';
import Link from 'components/link';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import useTranslate from 'hooks/translate';
import NextLink from 'next/link';
import type { FC, ReactNode } from 'react';
import { Fragment, useCallback, useEffect, useMemo } from 'react';

import styles from './component.module.css';
import { pageList } from './constants';

interface NavigationComponentProps {
  children: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

const NavigationComponent: FC<NavigationComponentProps> = ({ children, isOpen, toggle }) => {
  const { t } = useTranslate();

  const visiblePageList = useMemo(() => pageList.filter(page => page.isVisible), []);

  const renderPageCard = useCallback(
    page => (
      <div className={styles.pageCard} key={page.id} onClick={toggle}>
        <Link className={styles.pageTitle} href={page.href} text={t(page.text)} />
        <NextLink href={page.href}>
          <div className={styles.pageThumbnail} />
        </NextLink>
      </div>
    ),
    [t, toggle],
  );

  useEffect(() => {
    const pageCarousel = document.querySelector('.' + styles.pageCarousel);
    if (pageCarousel) {
      gsap.registerPlugin(ScrollToPlugin);
      const onMouseMove = event => {
        const scrollPercentX = event.pageX / window.innerWidth;
        const scrollWidthX = pageCarousel.scrollWidth - window.innerWidth;
        gsap.to(pageCarousel, {
          duration: 0.65,
          ease: 'power3',
          overwrite: true,
          scrollTo: {
            x: Math.floor(scrollPercentX * scrollWidthX * 1.4) - scrollWidthX * 0.2,
          },
        });
      };
      pageCarousel.addEventListener('mousemove', onMouseMove);
      const onMouseLeave = () => {
        gsap.to(pageCarousel, {
          duration: 0.65,
          ease: 'power3',
          overwrite: true,
          scrollTo: { x: 0 },
        });
      };
      pageCarousel.addEventListener('mouseleave', onMouseLeave);
      const onWheel = event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
      };
      pageCarousel.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        pageCarousel.removeEventListener('mouseleave', onMouseLeave);
        pageCarousel.removeEventListener('mousemove', onMouseMove);
        pageCarousel.removeEventListener('wheel', onWheel);
      };
    }
  }, []);

  useEffect(() => {
    const scroll = new GScroll('.' + styles.content);
    scroll.init();
    scroll.wheel();
    window.addEventListener('resize', scroll.resize);
    return () => {
      window.removeEventListener('resize', scroll.resize);
      scroll.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={classNames(styles.content, isOpen && styles.contentActive)} onClick={isOpen ? toggle : undefined}>
        {children}
      </div>
      {!(ClientEnvironment.isDevelopment || ClientEnvironment.isPreview || ClientEnvironment.isProduction) && (
        <Fragment>
          <div className={classNames(styles.menu, isOpen && styles.menuActive)}>
            <div className={styles.pageCarousel}>{visiblePageList.map(renderPageCard)}</div>
          </div>
          <div className={styles.floatingButton}>
            <button className={classNames(styles.toggleButton, isOpen && styles.toggleButtonActive)} onClick={toggle}>
              <span className={styles.toggleButtonLine1} />
              <span className={styles.toggleButtonLine2} />
              <span className={styles.toggleButtonLine3} />
            </button>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default NavigationComponent;
