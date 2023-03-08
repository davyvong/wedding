import Transition from 'components/transition';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import CookieBannerComponent from './component';

const CookieBanner: FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  const [hasPreferences, setHasPreferences] = useState<boolean>(true);

  const closeBanner = useCallback(() => {
    window.localStorage.setItem('cookies', JSON.stringify({}));
    setHasPreferences(true);
  }, []);

  useEffect(() => {
    setHasPreferences(!!window.localStorage.getItem('cookies'));
  }, []);

  return (
    <Transition isIn={!hasPreferences} ref={bannerRef}>
      <CookieBannerComponent closeBanner={closeBanner} />
    </Transition>
  );
};

export default CookieBanner;
