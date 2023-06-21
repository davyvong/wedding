'use client';

import { useEffect, useState } from 'react';

const useMediaQuery = (query: string): boolean | undefined => {
  const [matches, setMatches] = useState<boolean>();

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const onChange = (): void => {
      setMatches(matchMedia.matches);
    };
    onChange();
    matchMedia.addEventListener('change', onChange);
    return () => {
      matchMedia.removeEventListener('change', onChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
