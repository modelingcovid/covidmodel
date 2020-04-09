import * as React from 'react';
import {theme} from '../../styles';

import {Clock, MapMarker, PeopleArrows} from '../icon';
import {useModelData} from './useModelData';
import {formatMonths, formatPercent} from '../../lib/format';

export const DistancingInfo = () => {
  const {
    scenarioData: {distancingDays, distancingLevel},
    stateName,
  } = useModelData();
  if (distancingLevel == null) {
    return null;
  }

  return (
    <span>
      <MapMarker style={{marginRight: theme.spacing[0]}} />
      {stateName}
      <PeopleArrows
        style={{marginLeft: theme.spacing[1], marginRight: theme.spacing[0]}}
      />
      {formatPercent(1 - distancingLevel)}
      <Clock
        style={{
          marginLeft: theme.spacing[1],
          marginRight: theme.spacing[0],
        }}
      />
      {formatMonths(distancingDays)} months
    </span>
  );
};
