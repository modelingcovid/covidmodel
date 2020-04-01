import {useEffect, useRef} from 'react';

export const useComponentMounted = () => {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);
  return mountedRef.current;
};
