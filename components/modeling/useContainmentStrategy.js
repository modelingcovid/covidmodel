import {createContext, useCallback, useContext, useState} from 'react';

export const ContainmentStrategyContext = createContext('none');

export function useContainmentStrategy() {
  return useContext(ContainmentStrategyContext);
}

export const SetContainmentStrategyContext = createContext(() => null);

export function StatefulContainmentStrategy({initial = 'none', children}) {
  const [strategy, setStrategy] = useState(initial);
  return (
    <SetContainmentStrategyContext.Provider value={setStrategy}>
      <ContainmentStrategyContext.Provider value={strategy}>
        {children}
      </ContainmentStrategyContext.Provider>
    </SetContainmentStrategyContext.Provider>
  );
}

export function useSetContainmentStrategy() {
  return useContext(SetContainmentStrategyContext);
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
