import Transition from 'components/transition';
import type { FC, MouseEventHandler } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import CookieModalComponent from './component';

interface CookieModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const CookieModal: FC<CookieModalProps> = ({ isOpen, setIsOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const onClose = useCallback<MouseEventHandler<HTMLButtonElement>>(
    event => {
      event.stopPropagation();
      setIsOpen(false);
    },
    [setIsOpen],
  );

  useEffect(() => {
    if (isOpen) {
      const onClick = event => {
        if (!modalRef.current?.contains(event.target)) {
          setIsOpen(false);
        }
      };
      window.addEventListener('click', onClick);
      return () => {
        window.removeEventListener('click', onClick);
      };
    }
  }, [isOpen, setIsOpen]);

  return (
    <Transition isIn={isOpen} ref={modalRef}>
      <CookieModalComponent onClose={onClose} />
    </Transition>
  );
};

export default CookieModal;
