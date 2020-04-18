import {useMemo} from 'react';
import {useModelState} from '../modeling';
import {today, addDays} from '../../lib/date';

export function useDistancingInfo() {
  const {scenarioData} = useModelState();
  const {distancingDays, distancingLevel} = scenarioData();
  return useMemo(
    () => ({
      distancingDays,
      distancingLevel,
      distancingDate: addDays(today, distancingDays),
    }),
    [distancingDays, distancingLevel]
  );
}
