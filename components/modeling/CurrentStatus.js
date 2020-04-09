import * as React from 'react';
import {theme} from '../../styles';

import {useNearestData} from '../graph';
import {useModelData} from './useModelData';
import {getScenarioSummary} from '../../lib/controls';
import {daysToMonths} from '../../lib/date';
import {formatFixedDate, formatNumber, formatPercent} from '../../lib/format';

export const CurrentStatus = ({date = true}) => {
  const {scenarioData, stateName, x} = useModelData();
  const [nearest] = useNearestData();
  return (
    <span>
      Projection for {date ? `${formatFixedDate(x(nearest))} in ` : ''}
      {stateName} with {getScenarioSummary(scenarioData)}
    </span>
  );
};
