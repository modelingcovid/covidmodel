import * as React from 'react';
import {Area, Line, Points} from '../graph';

export const DistributionLine = ({
  y,
  color = 'var(--color-blue2)',
  curve,
  gradient = false,
}) => {
  return (
    <>
      <Area
        y0={y.percentile10.get}
        y1={y.percentile90.get}
        fill={color}
        opacity="0.1"
        curve={curve}
      />
      {gradient && (
        <>
          <Area
            y0={y.percentile20.get}
            y1={y.percentile80.get}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={y.percentile30.get}
            y1={y.percentile70.get}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={y.percentile40.get}
            y1={y.percentile60.get}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
        </>
      )}
      <Line
        y={y.percentile50.get}
        stroke={color}
        opacity="0.2"
        dot={false}
        curve={curve}
      />
      <Line y={y.expected.get} stroke={color} curve={curve} />
      <Points
        y={y.confirmed.get}
        stroke={color}
        strokeWidth={1.5}
        r={2}
        fill="var(--color-background)"
        nearestProps={() => ({r: 3.5})}
      />
    </>
  );
};
