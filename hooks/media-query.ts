import { useEffect, useState } from 'react';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

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
