import classNames from 'classnames';
import { Fragment } from 'react';
import type { FC, ReactNode } from 'react';

import styles from './component.module.css';

interface NavigationComponentProps {
  children: ReactNode;
  isOpen: boolean;
  toggle: () => void;
}

const NavigationComponent: FC<NavigationComponentProps> = ({ children, isOpen, toggle }) => (
  <Fragment>
    <div className={classNames(styles.content, isOpen && styles.contentOpen)} onClick={isOpen ? toggle : undefined}>
      {children}
    </div>
    <div className={classNames(styles.menu, isOpen && styles.menuOpen)} />
    <button className={classNames(styles.toggleButton, isOpen && styles.toggleButtonClose)} onClick={toggle}>
      <span className={styles.toggleButtonLine1} />
      <span className={styles.toggleButtonLine2} />
      <span className={styles.toggleButtonLine3} />
    </button>
  </Fragment>
);

export default NavigationComponent;
