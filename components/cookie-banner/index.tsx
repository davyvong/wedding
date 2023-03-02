import type { FC, MouseEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import CookieBannerComponent from './component';

const CookieBanner: FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasPreferences, setHasPreferences] = useState<boolean>(true);

  const closeBanner = useCallback(() => {
    window.localStorage.setItem('cookies', JSON.stringify({}));
    setHasPreferences(true);
  }, []);

  const openModal = useCallback<MouseEventHandler<HTMLAnchorElement>>(event => {
    event.stopPropagation();
    setIsOpen(true);
  }, []);

  useEffect(() => {
    setHasPreferences(!!window.localStorage.getItem('cookies'));
  }, []);

  useEffect(() => {
    if (isOpen) {
      const modalNode = modalRef.current;
      const onClick = event => {
        if (!modalNode?.contains(event.target)) {
          closeBanner();
        }
      };
      window.addEventListener('click', onClick);
      return () => {
        window.removeEventListener('click', onClick);
      };
    }
  }, [closeBanner, isOpen]);

  return (
    <CookieBannerComponent
      closeBanner={closeBanner}
      hasPreferences={hasPreferences}
      isOpen={isOpen}
      modalRef={modalRef}
      openModal={openModal}
    />
  );
};

export default CookieBanner;
