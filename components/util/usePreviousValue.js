import {useEffect, useRef} from 'react';

// https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
export const usePreviousValue = (trackedValue) => {
  const valueRef = useRef(trackedValue);
  useEffect(() => {
    valueRef.current = trackedValue;
  }, [trackedValue]);
  return valueRef.current;
};
