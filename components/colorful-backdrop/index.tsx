import useCSSSupport from 'hooks/css-support';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import ColorfulBackdropComponent from './component';

const ColorfulBackdrop = () => {
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
  const hasFilterSupport = useCSSSupport('filter', 'blur(20rem)');

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

  return <ColorfulBackdropComponent blobStyle={blobStyle} hasFilterSupport={hasFilterSupport} />;
};

export default ColorfulBackdrop;
