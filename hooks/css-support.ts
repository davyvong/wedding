import { useEffect, useState } from 'react';
import { isCSSSupported } from 'utils/browser';

const useCSSSupport = (property: string, value: string): boolean => {
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    setHasSupport(isCSSSupported(property, value));
  }, [property, value]);

  return hasSupport;
};

export default useCSSSupport;
