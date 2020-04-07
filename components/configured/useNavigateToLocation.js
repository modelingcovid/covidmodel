import {useCallback, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';

import {useCurrentLocation} from './useCurrentLocation';

export function useNavigateToLocation() {
  const {events, push} = useRouter();
  const currentLocation = useCurrentLocation();
  const navigating = useRef({from: currentLocation});

  navigating.current.from = currentLocation;

  useEffect(() => {
    const handler = (url) => {
      // Probably should check current here.
      navigating.current.to = null;
    };
    events.on('routeChangeComplete', handler);
    return () => events.off('routeChangeComplete', handler);
  }, [events, navigating]);

  return useCallback(
    (state) => {
      if (
        state !== navigating.current.from &&
        state !== navigating.current.to
      ) {
        navigating.current.to = state;
        push('/state/[state]', `/state/${state}`);
      }
    },
    [navigating, push]
  );
}
