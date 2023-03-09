import { useEffect, useState } from 'react';
import { isTouchDevice as isTouchDeviceUtil } from 'utils/browser';

const useTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTouchDevice(isTouchDeviceUtil);
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isTouchDevice;
};

export default useTouchDevice;
