import {useCallback} from 'react';
import {useRouter} from 'next/router';

export function useCurrentLocation() {
  return useRouter().query.state;
}
