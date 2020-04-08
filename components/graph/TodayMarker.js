import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {today} from '../../lib/date';

export const TodayMarker = ({anchor = 'start'}) => {
  return (
    <VMarker
      anchor={anchor}
      value={today}
      // label="Today"
      labelAnchor="middle"
      labelStroke="none"
      strokeDasharray="4,2"
      labelDy={anchor === 'start' ? -4 : 4}
    />
  );
};
