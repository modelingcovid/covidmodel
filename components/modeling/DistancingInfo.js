import * as React from 'react';
import {theme} from '../../styles';

import {Clock, PeopleArrows} from '../icon';
import {useModelData} from './useModelData';
import {daysToMonths} from '../../lib/date';
import {formatNumber, formatPercent} from '../../lib/format';

export const DistancingInfo = () => {
  const {
    scenarioData: {distancingDays, distancingLevel},
  } = useModelData();
  if (distancingLevel == null) {
    return null;
  }

  return (
    <span>
      <PeopleArrows style={{marginRight: theme.spacing[0]}} />
      {formatPercent(1 - distancingLevel)}
      <Clock
        style={{
          marginLeft: theme.spacing[1],
          marginRight: theme.spacing[0],
        }}
      />
      {formatNumber(daysToMonths(distancingDays))} months
    </span>
  );
};
