import { useEffect, useState } from 'react';
import { isStyleSupported } from 'utils/browser';

const useStyleSupport = (property: string, value: string): boolean => {
  const [hasSupport, setHasSupport] = useState<boolean>(false);

  useEffect(() => {
    setHasSupport(isStyleSupported(property, value));
  }, [property, value]);

  return hasSupport;
};

export default useStyleSupport;
