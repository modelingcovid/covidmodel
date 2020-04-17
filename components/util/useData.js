import {useCallback, useMemo, useRef} from 'react';
import useSWR from 'swr';

export function useData(query) {
  const latest = useRef(null);

  const reset = useCallback(() => {
    const request = {};
    request.promise = new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
    });
    latest.current = request;
  }, []);

  if (!latest.current) {
    reset();
  }

  const options = useMemo(
    () => ({
      onSuccess(data) {
        if (latest.current) {
          latest.current.resolve(data);
        }
        reset();
      },
      onError(err) {
        if (latest.current) {
          latest.current.reject(err);
        }
        reset();
      },
    }),
    []
  );

  const result = useSWR(query, options);
  const {data, error} = result;

  const request = latest.current;
  const accessor = useCallback(() => {
    if (typeof window === 'undefined') {
      return data;
    }
    if (data == null) {
      if (error) {
        throw error;
      }
      throw request.promise;
    }
    return data;
  }, [data, error, request]);

  return [accessor, result];
}
