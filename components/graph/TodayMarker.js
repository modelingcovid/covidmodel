import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {today} from '../../lib/date';

export const TodayMarker = ({anchor = 'start'}) => {
  return (
    <VMarker
      anchor={anchor}
      value={today}
      stroke="#8691a1"
      label="Today"
      labelAnchor="end"
      labelStroke="none"
      strokeDasharray="2,1"
      strokeWidth={1.5}
      labelDx={-6}
      labelDy={anchor === 'start' ? 30 : -30}
    />
  );
};
