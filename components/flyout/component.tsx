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
import CloseIconSVG from 'assets/icons/close.svg';
import { isBrowser } from 'client/browser';
import type { FC, TouchEvent, WheelEvent } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './component.module.css';

export interface FlyoutReferenceComponentProps {
  ref: (node: ReferenceType | null) => void;
}

export interface FlyoutContentComponentProps {
  setIsOpen: (open: boolean, shouldSkipAttemptToDismiss?: boolean) => void;
}

interface FlyoutComponentProps {
  onAttemptToDismiss?: () => boolean;
  onToggleFlyout?: (open: boolean) => void;
  openWithURLParam?: string;
  renderContent: (props: FlyoutContentComponentProps) => JSX.Element;
  renderReference: (props: FlyoutReferenceComponentProps) => JSX.Element;
}

const FlyoutComponent: FC<FlyoutComponentProps> = ({
  onAttemptToDismiss,
  onToggleFlyout,
  openWithURLParam,
  renderContent,
  renderReference,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleFlyout = useCallback(
    (open: boolean, shouldSkipAttemptToDismiss: boolean = false): void => {
      if (!shouldSkipAttemptToDismiss && !open && onAttemptToDismiss && !onAttemptToDismiss()) {
        return;
      }
      setIsOpen(open);
      if (onToggleFlyout) {
        onToggleFlyout(open);
      }
      if (!open) {
        const url = new URL(window.location.href);
        url.searchParams.delete('flyout');
        window.history.pushState({ path: url.href }, '', url.href);
      }
    },
    [onAttemptToDismiss, onToggleFlyout],
  );

  const onOpenChange = useCallback(
    (open: boolean): void => {
      toggleFlyout(open);
    },
    [toggleFlyout],
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
      transform: 'translateX(100%)',
    },
    duration: 650,
    initial: {
      transform: 'translateX(100%)',
    },
    open: {
      transform: 'translateX(0%)',
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
    if (isBrowser() && openWithURLParam) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('flyout') === openWithURLParam) {
        toggleFlyout(true);
      }
    }
  }, [openWithURLParam, toggleFlyout]);

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
                className={styles.flyout}
                onTouchStart={(event: TouchEvent<HTMLDivElement>): void => event.stopPropagation()}
                onWheel={(event: WheelEvent<HTMLDivElement>): void => event.stopPropagation()}
                ref={refs.setFloating}
                style={transitionStyles}
                {...getFloatingProps()}
              >
                <button className={styles.closeButton} onClick={(): void => toggleFlyout(false)}>
                  <CloseIconSVG />
                </button>
                {renderContent({ setIsOpen: toggleFlyout })}
              </div>
            </FloatingFocusManager>
          </Fragment>,
          document.body,
        )}
    </Fragment>
  );
};

export default FlyoutComponent;
