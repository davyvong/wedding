import classNames from 'classnames';
import Transition from 'components/transition';
import { Fragment } from 'react';
import type { FC, RefObject } from 'react';

import styles from './component.module.css';

interface NavigationComponentProps {
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement>;
  toggle: () => void;
}

const NavigationComponent: FC<NavigationComponentProps> = ({ isOpen, menuRef, toggle }) => (
  <Fragment>
    <Transition
      duration={650}
      inStyle={{ transform: 'translateY(-100%)' }}
      isIn={isOpen}
      outStyle={{ transform: 'translateY(0)' }}
      ref={menuRef}
    >
      <div className={styles.menu} />
    </Transition>
    <button className={classNames(styles.toggleButton, isOpen && styles.toggleButtonClose)} onClick={toggle}>
      <span className={styles.toggleButtonLine1} />
      <span className={styles.toggleButtonLine2} />
      <span className={styles.toggleButtonLine3} />
    </button>
  </Fragment>
);

export default NavigationComponent;
