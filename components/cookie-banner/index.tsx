import CookieModal from 'components/cookie-modal';
import Transition from 'components/transition';
import type { FC, MouseEventHandler } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import CookieBannerComponent from './component';

const CookieBanner: FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

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

  return (
    <Fragment>
      <Transition isIn={!hasPreferences} ref={bannerRef}>
        <CookieBannerComponent closeBanner={closeBanner} openModal={openModal} />
      </Transition>
      <CookieModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </Fragment>
  );
};

export default CookieBanner;
