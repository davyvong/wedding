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
    <Transition
      delay={50}
      duration={300}
      inStyle={{
        opacity: 1,
        transition: 'opacity 300ms ease-in-out',
      }}
      isIn={!hasPreferences}
      ref={bannerRef}
      onIn={() => {}}
      onOut={() => {}}
      outStyle={{
        opacity: 0,
        transition: 'opacity 300ms ease-in-out',
      }}
    >
      <CookieBannerComponent closeBanner={closeBanner} />
    </Transition>
  );
};

export default CookieBanner;
