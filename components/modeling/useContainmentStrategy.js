import {createContext, useCallback, useContext} from 'react';

export const ContainmentStrategyContext = createContext('none');

export function useContainmentStrategy() {
  return useContext(ContainmentStrategyContext);
}

export function useExpected() {
  const strategy = useContainmentStrategy();
  return useCallback(
    (distribution) => {
      switch (strategy) {
        case 'testTrace':
          return distribution.expectedTestTrace;
        case 'none':
        default:
          return distribution.expected;
      }
    },
    [strategy]
  );
}
