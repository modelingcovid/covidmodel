import {useMemo} from 'react';
import {useModelState} from '../modeling';
import {today, addDays} from '../../lib/date';

export function useDistancingInfo() {
  const {scenarioData} = useModelState();
  const {distancingDays, distancingLevel} = scenarioData();
  const hasDistancing = distancingLevel !== 1;
  return useMemo(
    () => ({
      distancingDays,
      distancingLevel,
      distancingDate: hasDistancing ? addDays(today, distancingDays) : today,
    }),
    [distancingDays, distancingLevel]
  );
}
