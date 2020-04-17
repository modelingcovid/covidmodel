import {useCallback, useMemo, useRef} from 'react';
import {fetchSuspendable} from '../../lib/fetch';

export function useFetch(query) {
  return fetchSuspendable(query);
}
