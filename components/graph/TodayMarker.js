import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {today} from '../../lib/date';

export const TodayMarker = ({anchor = 'start'}) => {
  return (
    <VMarker
      anchor={anchor}
      value={today}
      stroke="var(--color-gray2)"
      label="Today"
      labelAnchor="middle"
      labelStroke="none"
      strokeDasharray="4,2"
      strokeWidth={1}
      labelDy={anchor === 'start' ? -4 : 4}
    />
  );
};
