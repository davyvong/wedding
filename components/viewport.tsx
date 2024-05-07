'use client';

import { useEffect, type FC } from 'react';

const Viewport: FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent.indexOf('iPhone') > 1) {
      document
        .querySelector('[name=viewport]')
        ?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    }
  }, []);

  return null;
};

export default Viewport;
