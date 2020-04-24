import * as React from 'react';
import {useLocationData} from './useLocationData';
import {Area, ClipPathX, Line, Points} from '../graph';
import {useComponentId} from '../util';

export function DistributionLineContents({
  y,
  color = 'var(--color-blue2)',
  curve,
  gradient = false,
  points = true,
}) {
  return (
    <>
      <Area
        y0={y.percentile10.get}
        y1={y.percentile90.get}
        fill={color}
        opacity="0.05"
        curve={curve}
      />
      {gradient && (
        <>
          <Area
            y0={y.percentile20.get}
            y1={y.percentile80.get}
            fill={color}
            opacity="0.05"
            curve={curve}
          />
          <Area
            y0={y.percentile30.get}
            y1={y.percentile70.get}
            fill={color}
            opacity="0.05"
            curve={curve}
          />
          <Area
            y0={y.percentile40.get}
            y1={y.percentile60.get}
            fill={color}
            opacity="0.05"
            curve={curve}
          />
        </>
      )}
      <Line
        y={y.percentile10.get}
        stroke={color}
        strokeWidth={0.75}
        opacity="0.1"
        dot={false}
        curve={curve}
      />
      <Line
        y={y.percentile90.get}
        stroke={color}
        strokeWidth={0.75}
        opacity="0.1"
        dot={false}
        curve={curve}
      />
      <Line
        y={y.percentile50.get}
        stroke={color}
        opacity="0.1"
        dot={false}
        curve={curve}
      />
      <Line y={y.expected.get} stroke={color} curve={curve} />
      {points && (
        <Points
          y={y.confirmed.get}
          stroke={color}
          strokeWidth={1.5}
          r={2}
          fill="var(--color-background)"
          nearestProps={() => ({r: 3.5})}
        />
      )}
    </>
  );
}

export function DistributionLine(props) {
  const {y, color, curve} = props;
  const {dateContained} = useLocationData();
  const id = useComponentId('distribution-line');
  const right = `${id}-r`;
  return (
    <>
      <ClipPathX right={right} value={new Date(dateContained())} />
      <DistributionLineContents {...props} />
      <g clipPath={`url(#${right})`}>
        <Line
          y={y.expectedTestTrace.get}
          stroke={color}
          curve={curve}
          opacity="0.5"
          strokeDasharray="4,2"
          dot={false}
        />
      </g>
    </>
  );
}
