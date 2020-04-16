import * as React from 'react';

const {useCallback, useReducer} = React;

export const Suspense =
  typeof window === 'undefined'
    ? function Suspense() {
        // We don’t return the fallback on the server because React won’t
        // recognize the fallback when hydrating on the client; React displays
        // the warnForDeletedHydratableElement warning instead.
        return null;
      }
    : React.Suspense;

export function useSuspense() {
  const [count, render] = useReducer((x) => x + 1, 0);

  return useCallback(
    (fn, fallback = null) => {
      if (typeof window === 'undefined') {
        return fallback;
      }
      try {
        return fn();
      } catch (result) {
        if (result.then) {
          result.then(render);
          return fallback;
        }
        throw result;
      }
    },
    [count]
  );
}
