import {useCallback, useMemo, useRef} from 'react';
import useSWR from 'swr';

export function useData(query) {
  const promise = useRef(null);

  const options = useMemo(
    () => ({
      onSuccess(data) {
        if (promise.current) {
          promise.current.resolve(data);
        }
        promise.current = null;
      },
      onError(err) {
        if (promise.current) {
          promise.current.reject(err);
        }
        promise.current = null;
      },
    }),
    []
  );

  const result = useSWR(query, options);
  const {data, error} = result;

  const accessor = useCallback(() => {
    if (typeof window === 'undefined') {
      return data;
    }
    if (data == null) {
      if (error) {
        throw error;
      }
      if (!promise.current) {
        promise.current = {};
        promise.current.promise = new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
        });
      }
      throw promise.current.promise;
    }
    return data;
  }, [data, error]);

  return [accessor, result];
}
