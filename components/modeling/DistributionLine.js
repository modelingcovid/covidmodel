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
  // return <DistributionLineContents {...props} />;

  const {y, color, curve} = props;
  const {dateContained} = useLocationData();
  const id = useComponentId('distribution-line');
  const left = `${id}-l`;
  const right = `${id}-r`;
  return (
    <>
      <ClipPathX left={left} right={right} value={new Date(dateContained())} />
      <g clipPath={`url(#${left})`}>
        <DistributionLineContents {...props} />
      </g>
      <g clipPath={`url(#${right})`} opacity="0.1">
        <DistributionLineContents {...props} />
      </g>
      <g clipPath={`url(#${right})`}>
        <Line y={y.expectedTestTrace.get} stroke={color} curve={curve} />
      </g>
    </>
  );
}
