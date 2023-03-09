import { useEffect, useState } from 'react';
import { isTouchDevice } from 'utils/browser';

const useTouchDevice = (): boolean => {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHasTouch(isTouchDevice);
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return hasTouch;
};

export default useTouchDevice;
