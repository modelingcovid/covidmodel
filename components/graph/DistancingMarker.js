import * as React from 'react';
import {VMarker} from './Marker';
import {useDistancingInfo} from '../modeling';
import {today, addDays} from '../../lib/date';

const {useMemo} = React;

export function DistancingMarker({anchor = 'start'}) {
  const {distancingDate, distancingLevel} = useDistancingInfo();
  if (distancingLevel === 1) {
    return null;
  }
  return (
    <VMarker
      anchor={anchor}
      value={distancingDate}
      labelAnchor="middle"
      labelStroke="none"
      strokeDasharray="4,2"
      labelDy={anchor === 'start' ? -4 : 4}
    />
  );
}
