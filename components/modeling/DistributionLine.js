import * as React from 'react';
import {Area, Line, Points} from '../graph';
import {getDate} from '../../lib/date';

export const DistributionLine = ({
  y,
  color = 'var(--color-blue2)',
  curve,
  gradient = false,
}) => {
  if (!y) {
    return null;
  }
  return (
    <>
      <Area
        y0={y.percentile10}
        y1={y.percentile90}
        fill={color}
        opacity="0.1"
        curve={curve}
      />
      {gradient && (
        <>
          <Area
            y0={y.percentile20}
            y1={y.percentile80}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={y.percentile30}
            y1={y.percentile70}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={y.percentile40}
            y1={y.percentile60}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
        </>
      )}
      <Line
        y={y.percentile50}
        stroke={color}
        opacity="0.2"
        dot={false}
        curve={curve}
      />
      <Line y={y.expected} stroke={color} curve={curve} />
      <Points
        y={y.confirmed}
        stroke={color}
        strokeWidth={1.5}
        r={2}
        fill="var(--color-background)"
        nearestProps={() => ({r: 3.5})}
      />
    </>
  );
};
