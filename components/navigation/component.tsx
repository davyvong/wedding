import classNames from 'classnames';
import Link from 'components/link';
import useTranslate from 'hooks/translate';
import { Fragment } from 'react';
import type { FC, ReactNode } from 'react';

import styles from './component.module.css';

interface NavigationComponentProps {
  children: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

const NavigationComponent: FC<NavigationComponentProps> = ({ children, isOpen, toggle }) => {
  const t = useTranslate();

  return (
    <Fragment>
      <div className={classNames(styles.content, isOpen && styles.contentActive)} onClick={isOpen ? toggle : undefined}>
        {children}
      </div>
      <div className={classNames(styles.menu, isOpen && styles.menuActive)}>
        <Link href="/" onClick={toggle} text={t('components.navigation.home')} />
        <Link href="/gallery" onClick={toggle} text={t('components.navigation.gallery')} />
        <Link href="/cookie-policy" onClick={toggle} text={t('components.navigation.cookie-policy')} />
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
