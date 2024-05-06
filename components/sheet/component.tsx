'use client';

import {
  FloatingFocusManager,
  FloatingOverlay,
  ReferenceType,
  autoUpdate,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import type { FC, TouchEvent, WheelEvent } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './component.module.css';

export interface SheetReferenceComponentProps {
  ref: (node: ReferenceType | null) => void;
}

export interface SheetContentComponentProps {
  setIsOpen: (open: boolean, shouldSkipAttemptToDismiss?: boolean) => void;
}

interface SheetComponentProps {
  onAttemptToDismiss?: () => boolean;
  onToggleSheet?: (open: boolean) => void;
  renderContent: (props: SheetContentComponentProps) => JSX.Element;
  renderReference: (props: SheetReferenceComponentProps) => JSX.Element;
}

const SheetComponent: FC<SheetComponentProps> = ({
  onAttemptToDismiss,
  onToggleSheet,
  renderContent,
  renderReference,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleSheet = useCallback(
    (open: boolean, shouldSkipAttemptToDismiss: boolean = false): void => {
      if (!shouldSkipAttemptToDismiss && !open && onAttemptToDismiss && !onAttemptToDismiss()) {
        return;
      }
      setIsOpen(open);
      if (onToggleSheet) {
        onToggleSheet(open);
      }
      if (!open) {
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        window.history.pushState({ path: url.href }, '', url.href);
      }
    },
    [onAttemptToDismiss, onToggleSheet],
  );

  const onOpenChange = useCallback(
    (open: boolean): void => {
      toggleSheet(open);
    },
    [toggleSheet],
  );

  const { refs, context } = useFloating({
    onOpenChange,
    open: isOpen,
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    close: {
      transform: 'translate(-50%, 100%)',
    },
    duration: 650,
    initial: {
      transform: 'translate(-50%, 100%)',
    },
    open: {
      transform: 'translate(-50%, 0%)',
    },
  });
  const { styles: backdropStyles } = useTransitionStyles(context, {
    close: {
      opacity: 0,
    },
    duration: 650,
    initial: {
      opacity: 0,
    },
    open: {
      opacity: 1,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  useEffect(() => {
    if (isOpen) {
      const stopPropagation = (event): void => event.stopPropagation();
      document.body.addEventListener('touchstart', stopPropagation, { passive: false });
      document.body.addEventListener('wheel', stopPropagation, { passive: false });
      return () => {
        document.body.removeEventListener('touchstart', stopPropagation);
        document.body.removeEventListener('wheel', stopPropagation);
      };
    }
  }, [isOpen]);

  return (
    <Fragment>
      {renderReference({ ref: refs.setReference, ...getReferenceProps() })}
      {isMounted &&
        createPortal(
          <Fragment>
            <FloatingOverlay className={styles.overlay} lockScroll>
              <div className={styles.overlayBlur} style={backdropStyles} />
            </FloatingOverlay>
            <FloatingFocusManager context={context}>
              <div
                className={styles.container}
                onTouchStart={(event: TouchEvent<HTMLDivElement>): void => event.stopPropagation()}
                onWheel={(event: WheelEvent<HTMLDivElement>): void => event.stopPropagation()}
                ref={refs.setFloating}
                style={transitionStyles}
                {...getFloatingProps()}
              >
                <div className={styles.sheet}>{renderContent({ setIsOpen: toggleSheet })}</div>
              </div>
            </FloatingFocusManager>
          </Fragment>,
          document.body,
        )}
    </Fragment>
  );
};

export default SheetComponent;
