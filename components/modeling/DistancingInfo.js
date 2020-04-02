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
  return (
    <span>
      {distancingLevel && (
        <span style={{marginRight: theme.spacing[1]}}>
          <PeopleArrows style={{marginRight: theme.spacing[0]}} />
          {formatPercent(1 - distancingLevel)}
        </span>
      )}
      <Clock
        style={{
          marginRight: theme.spacing[0],
        }}
      />
      {formatNumber(daysToMonths(distancingDays))} months
    </span>
  );
};
