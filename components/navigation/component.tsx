'use client';

import classNames from 'classnames';
import Link from 'components/link';
import useTranslate from 'hooks/translate';
import NextLink from 'next/link';
import { Fragment } from 'react';
import type { FC, ReactNode } from 'react';

import styles from './component.module.css';

interface NavigationComponentProps {
  children: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

const NavigationComponent: FC<NavigationComponentProps> = ({ children, isOpen, toggle }) => {
  const { t } = useTranslate();

  return (
    <Fragment>
      <div className={classNames(styles.content, isOpen && styles.contentActive)} onClick={isOpen ? toggle : undefined}>
        {children}
      </div>
      <div className={classNames(styles.menu, isOpen && styles.menuActive)}>
        <div className={styles.pageCarousel}>
          <div className={styles.pageCard} onClick={toggle}>
            <Link className={styles.pageTitle} href="/" text={t('components.navigation.home')} />
            <NextLink href="/">
              <div className={styles.pageThumbnail} />
            </NextLink>
          </div>
          <div className={styles.pageCard} onClick={toggle}>
            <Link className={styles.pageTitle} href="/rsvp" text={t('components.navigation.rsvp')} />
            <NextLink href="/rsvp">
              <div className={styles.pageThumbnail} />
            </NextLink>
          </div>
          <div className={styles.pageCard} onClick={toggle}>
            <Link className={styles.pageTitle} href="/schedule" text={t('components.navigation.schedule')} />
            <NextLink href="/schedule">
              <div className={styles.pageThumbnail} />
            </NextLink>
          </div>
          <div className={styles.pageCard} onClick={toggle}>
            <Link className={styles.pageTitle} href="/story" text={t('components.navigation.story')} />
            <NextLink href="/story">
              <div className={styles.pageThumbnail} />
            </NextLink>
          </div>
          <div className={styles.pageCard} onClick={toggle}>
            <Link className={styles.pageTitle} href="/gallery" text={t('components.navigation.gallery')} />
            <NextLink href="/gallery">
              <div className={styles.pageThumbnail} />
            </NextLink>
          </div>
        </div>
      </div>
      <div className={styles.floatingButton}>
        <button className={classNames(styles.toggleButton, isOpen && styles.toggleButtonActive)} onClick={toggle}>
          <span className={styles.toggleButtonLine1} />
          <span className={styles.toggleButtonLine2} />
          <span className={styles.toggleButtonLine3} />
        </button>
      </div>
    </Fragment>
  );
};

export default NavigationComponent;
