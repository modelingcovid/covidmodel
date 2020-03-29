import * as React from 'react';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

const {useEffect, useLayoutEffect, useState} = React;

export const emptyContentRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const useSafeLayoutEffect = (fn, deps) => {
  if (typeof window === 'undefined') {
    // Trade one effect for another, but no-op on the server.
    useEffect(() => {}, []);
  } else {
    useLayoutEffect(fn, deps);
  }
};

export const useContentRect = (elementRef, defaultRect = {}) => {
  const [contentRect, setContentRect] = useState(() => ({
    ...emptyContentRect,
    ...defaultRect,
  }));
  useSafeLayoutEffect(() => {
    if (!elementRef.current) {
      return;
    }
    const observer = new ResizeObserverPolyfill((entries) =>
      setContentRect(entries[0].contentRect)
    );
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [elementRef]);
  return contentRect;
};
