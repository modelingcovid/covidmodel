import {useCallback} from 'react';
import {useRouter} from 'next/router';

export function useNavigateToLocation() {
  const {push} = useRouter();
  return useCallback((state) => push('/state/[state]', `/state/${state}`), [
    push,
  ]);
}
