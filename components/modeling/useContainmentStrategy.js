import {createContext, useCallback, useContext, useState, useMemo} from 'react';
import {useLocationData} from './useLocationData';
import {useSuspense} from '../util';

export const ContainmentStrategyContext = createContext('none');

export function useContainmentStrategy() {
  return useContext(ContainmentStrategyContext);
}

export const SetContainmentStrategyContext = createContext(() => null);

export function StatefulContainmentStrategy({initial = 'none', children}) {
  const {dateContained} = useLocationData();
  const [strategyState, setStrategy] = useState(initial);

  const suspense = useSuspense();
  const isContained = suspense(() => !!dateContained(), false);
  const strategy = useMemo(() => (isContained ? strategyState : 'none'), [
    isContained,
    strategyState,
  ]);
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

export function useExpectedMax(distribution) {
  const expected = useExpected();
  return useCallback(() => expected(distribution).max(), [
    distribution,
    expected,
  ]);
}
