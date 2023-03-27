'use client';

import merge from 'lodash.merge';
import PopperJS, { PopperOptions } from 'popper.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC, ReactElement, RefObject } from 'react';

import PopoverComponent from './component';

interface PopoverProps {
  anchorRef: RefObject<HTMLElement>;
  children?: ReactElement;
  isOpen: boolean;
  onClose: () => void;
  options?: PopperOptions;
}

const Popover: FC<PopoverProps> = ({ anchorRef, isOpen, onClose, options, ...props }) => {
  const childrenRef = useRef<HTMLElement>(null);
  const popperRef = useRef<PopperJS>();
  const [isRendered, setIsRendered] = useState<boolean>(isOpen);

  const closePopover = useCallback(() => {
    onClose();
    setIsRendered(false);
  }, [onClose]);

  const onMousedown = useCallback(
    event => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(event.target) &&
        childrenRef.current &&
        !childrenRef.current.contains(event.target)
      ) {
        closePopover();
      }
    },
    [anchorRef, childrenRef, closePopover],
  );

  const openPopover = useCallback(() => {
    setIsRendered(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !childrenRef.current) {
      return;
    }
    if (popperRef.current) {
      popperRef.current.destroy();
    }
    popperRef.current = new PopperJS(
      anchorRef.current,
      childrenRef.current,
      merge({ modifiers: { offset: { offset: '0, 16' }, preventOverflow: { padding: 16 } } }, options),
    );
  }, [anchorRef, options]);

  useEffect(() => {
    (isOpen ? openPopover : closePopover)();
  }, [closePopover, isOpen, openPopover]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousedown', onMousedown, { passive: true });
    }
    return () => {
      if (isOpen) {
        window.removeEventListener('mousedown', onMousedown);
      }
    };
  }, [isOpen, onMousedown]);

  return (
    <PopoverComponent
      anchorRef={anchorRef}
      childrenRef={childrenRef}
      isOpen={isRendered}
      updatePosition={updatePosition}
      {...props}
    />
  );
};

export default Popover;
