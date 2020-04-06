import {useCallback, useRef} from 'react';
import {useRouter} from 'next/router';

import {useCurrentLocation} from './useCurrentLocation';

export function useNavigateToLocation() {
  const {push} = useRouter();
  const currentLocation = useCurrentLocation();
  const navigating = useRef({from: currentLocation});

  navigating.current.from = currentLocation;
  if (currentLocation === navigating.current.to) {
    navigating.current.to = null;
  }

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
