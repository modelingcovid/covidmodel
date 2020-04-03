import {useEffect, useState} from 'react';

export function useMatchMedia(mediaQuery, defaultValue = false) {
  const query = mediaQuery.replace(/^@media\s?/, '');
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handler = (e) => setMatches(e.matches);
    mediaQueryList.addListener(handler);
    return () => mediaQueryList.removeListener(handler);
  }, [query]);

  return matches;
}
