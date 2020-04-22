import {useCallback, useMemo} from 'react';
import {useModelState} from '../modeling';
import {getDistancingDate} from '../../lib/controls';
import {today} from '../../lib/date';

export function useDistancingDate(offset) {
  const {scenarioData} = useModelState();
  return useCallback(() => {
    const {distancingDays, distancingLevel} = scenarioData();
    return distancingLevel !== 1
      ? getDistancingDate(distancingDays, offset)
      : today;
  }, [scenarioData]);
}

export function useDistancingInfo() {
  const {scenarioData} = useModelState();
  const scenario = scenarioData();
  const distancingDate = useDistancingDate();
  return useMemo(() => [scenario, distancingDate()], [scenario]);
}
