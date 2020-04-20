import {useMemo} from 'react';
import {useModelState} from '../modeling';
import {today, addDays} from '../../lib/date';

export function useDistancingInfo() {
  const {scenarioData} = useModelState();
  const scenario = scenarioData();
  return useMemo(
    () => [
      scenario,
      scenario.distancingLevel !== 1
        ? addDays(today, scenario.distancingDays)
        : today,
    ],
    [scenario]
  );
}
