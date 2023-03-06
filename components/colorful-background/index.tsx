import { CSSProperties, useCallback, useEffect, useState } from 'react';

import ColorfulBackgroundComponent from './component';

const ColorfulBackground = () => {
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBlobStyle(generateBlobStyle());
    }, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, [generateBlobStyle]);

  return <ColorfulBackgroundComponent blobStyle={blobStyle} />;
};

export default ColorfulBackground;
