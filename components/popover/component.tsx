import classNames from 'classnames';
import Transition from 'components/transition';
import type { FC, ReactElement, RefObject } from 'react';

import styles from './component.module.css';

interface PopoverComponentProps {
  anchorRef: RefObject<HTMLElement>;
  children?: ReactElement;
  childrenRef: RefObject<HTMLElement>;
  className?: string;
  isOpen: boolean;
  updatePosition: () => void;
}

const PopoverComponent: FC<PopoverComponentProps> = ({
  anchorRef,
  children,
  childrenRef,
  className,
  isOpen,
  updatePosition,
  ...props
}) => (
  <Transition isIn={Boolean(anchorRef.current) && isOpen} onIn={updatePosition} ref={childrenRef}>
    <div className={classNames(styles.container, className)} {...props}>
      {children}
    </div>
  </Transition>
);

export default PopoverComponent;
