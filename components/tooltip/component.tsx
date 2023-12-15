'use client';

import {
  Placement,
  autoUpdate,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import classNames from 'classnames';
import { Fragment, ReactNode, cloneElement, useState } from 'react';
import type { FC, ReactElement } from 'react';

import styles from './component.module.css';

interface TooltipProps {
  children: ReactElement;
  disabled?: boolean;
  inverse?: boolean;
  placement?: string;
  renderContent: () => JSX.Element | ReactElement | ReactNode | string;
}

const Tooltip: FC<TooltipProps> = ({ children, disabled = false, inverse = false, placement, renderContent }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), shift({ padding: 32 })],
    onOpenChange: setIsOpen,
    open: isOpen,
    placement: placement as Placement,
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, { duration: 150 });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <Fragment>
      {cloneElement(children, { ref: refs.setReference, ...getReferenceProps() })}
      {!disabled && isMounted && (
        <div
          className={classNames(styles.tooltip, inverse && styles.tooltipInverse)}
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles }}
          {...getFloatingProps()}
        >
          {renderContent()}
        </div>
      )}
    </Fragment>
  );
};

export default Tooltip;
