import * as React from 'react';
import {theme} from '../../styles';

import {useNearestData} from '../graph';
import {useModelState} from './useModelState';
import {getScenarioSummary} from '../../lib/controls';
import {daysToMonths} from '../../lib/date';
import {formatFixedDate, formatNumber, formatPercent} from '../../lib/format';

export const CurrentStatus = ({date = true}) => {
  const {scenario, location, x} = useModelState();
  const nearest = useNearestData();
  return (
    <span>
      Projection for {date ? `${formatFixedDate(x(...nearest))} in ` : ''}
      {location.name} with {getScenarioSummary(scenario)}
    </span>
  );
};
