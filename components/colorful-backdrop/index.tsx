import Transition from 'components/transition';
import useCSSSupport from 'hooks/css-support';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import ColorfulBackdropComponent from './component';

const ColorfulBackdrop = () => {
  const backdropRef = useRef<HTMLDivElement>(null);

  const generateBlobStyle = useCallback((): CSSProperties => {
    const generateRandomPercentage = () => Math.floor(Math.random() * 100) + '%';
    let borderRadius = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) {
        borderRadius += ' /';
      }
      if (i > 0) {
        borderRadius += ' ';
      }
      borderRadius += generateRandomPercentage();
    }
    return { borderRadius };
  }, []);

  const [blobStyle, setBlobStyle] = useState<CSSProperties>({ borderRadius: '0%' });
  const hasFilterSupport = useCSSSupport('filter', 'blur(7rem)');

  useEffect(() => {
    if (hasFilterSupport) {
      const intervalId = setInterval(() => {
        setBlobStyle(generateBlobStyle());
      }, 3000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [generateBlobStyle, hasFilterSupport]);

  return (
    <Transition isIn={hasFilterSupport} ref={backdropRef}>
      <ColorfulBackdropComponent blobStyle={blobStyle} />
    </Transition>
  );
};

export default ColorfulBackdrop;
