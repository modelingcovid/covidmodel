import * as React from 'react';
import {VMarker} from './Marker';
import {useModelData} from '../modeling';
import {today, addDays} from '../../lib/date';

const {useMemo} = React;

export function DistancingMarker({anchor = 'start'}) {
  const {
    scenarioData: {distancingDays, distancingLevel},
  } = useModelData();
  const date = useMemo(() => addDays(today, distancingDays), [distancingDays]);
  if (distancingLevel === 1) {
    return null;
  }
  return (
    <VMarker
      anchor={anchor}
      value={date}
      labelAnchor="middle"
      labelStroke="none"
      strokeDasharray="4,2"
      labelDy={anchor === 'start' ? -4 : 4}
    />
  );
}
