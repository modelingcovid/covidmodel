import * as React from 'react';
import {Marker} from '@vx/marker';
import {useGraphData} from './useGraphData';

const today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);

export const TodayMarker = () => {
  const {xScale, yMax} = useGraphData();
  return (
    <Marker
      from={{x: xScale(today), y: 0}}
      to={{x: xScale(today), y: yMax}}
      stroke="#8691a1"
      label="Today"
      labelStroke="none"
      strokeDasharray="2,1"
      strokeWidth={1.5}
      labelDx={6}
      labelDy={15}
    />
  );
};
