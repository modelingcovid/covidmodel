import * as React from 'react';
import {theme} from '../../styles';

import {useNearestData} from '../graph';
import {useModelData} from './useModelData';
import {daysToMonths} from '../../lib/date';
import {formatFixedDate, formatNumber, formatPercent} from '../../lib/format';

export const CurrentStatus = () => {
  const {
    scenarioData: {distancingDays, distancingLevel},
    stateName,
    x,
  } = useModelData();
  const [nearest] = useNearestData();
  const distancing =
    distancingLevel === 1
      ? 'no distancing'
      : `${formatPercent(1 - distancingLevel)} distancing for ${formatNumber(
          daysToMonths(distancingDays)
        )} months`;

  return (
    <span>
      Projection for {formatFixedDate(x(nearest))} in {stateName} with{' '}
      {distancing}
    </span>
  );
};
