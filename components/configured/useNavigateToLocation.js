import {useCallback} from 'react';
import {useRouter} from 'next/router';

import {useCurrentLocation} from './useCurrentLocation';

export function useNavigateToLocation() {
  const {push} = useRouter();
  const currentLocation = useCurrentLocation();
  return useCallback(
    (state) => {
      if (state !== currentLocation) {
        push('/state/[state]', `/state/${state}`);
      }
    },
    [currentLocation, push]
  );
}
