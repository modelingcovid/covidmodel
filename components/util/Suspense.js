import * as React from 'react';

const {useCallback, useReducer} = React;

export function Suspense(props) {
  if (typeof window === 'undefined') {
    return props.fallback || null;
  }
  return <React.Suspense {...props} />;
}

export function useSuspense() {
  const [count, render] = useReducer((x) => x + 1, 0);

  return useCallback((fn, fallback = null) => {
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
  });
}
