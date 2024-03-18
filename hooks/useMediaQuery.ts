'use client';

import { useEffect, useState } from 'react';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState<boolean>(window.matchMedia(query).matches);

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const checkMatch = (event): void => {
      setMatches(event.matches);
    };
    matchMedia.addEventListener('change', checkMatch);
    return (): void => {
      matchMedia.removeEventListener('change', checkMatch);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
