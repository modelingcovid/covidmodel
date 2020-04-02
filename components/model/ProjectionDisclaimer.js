import * as React from 'react';
import {Label} from '../content';
import {useModelData} from './useModelData';
import {daysToMonths} from '../../lib/date';
import {formatNumber, formatPercent} from '../../lib/format';

export const ProjectionDisclaimer = () => {
  const {scenarioData} = useModelData();
  console.log('distancinglevel', scenarioData);
  const {distancingDays, distancingLevel, maintain} = scenarioData;

  let distancing = null;
  if (distancingLevel != null) {
    if (distancingLevel < 1) {
      distancing = formatPercent(1 - distancingLevel);
    } else {
      distancing = 'no social';
    }
  } else if (maintain) {
    distancing = 'current levels of';
  }

  return (
    <Label>
      <span>The model projects</span> that with {distancing} distancing for the
      next {formatNumber(daysToMonths(distancingDays))} months…
    </Label>
  );
};
