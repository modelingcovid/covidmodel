import {useCallback, useMemo, useRef} from 'react';
import {fetch} from '../../lib/fetch';

export function useFetch(query) {
  return fetch(query);
}
