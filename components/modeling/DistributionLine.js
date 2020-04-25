import * as React from 'react';
import {ContainmentSplit} from './ContainmentSplit';
import {useContainmentStrategy, useExpected} from './useContainmentStrategy';
import {useLocationData} from './useLocationData';
import {Area, ClipPathX, Line, Points} from '../graph';
import {useComponentId} from '../util';

export function DistributionLineContents({
  y,
  color,
  curve,
  gradient = false,
  points = true,
}) {
  const strategy = useContainmentStrategy();
  const showPercentiles = strategy === 'none';
  const expected = useExpected();
  return (
    <>
      {showPercentiles && (
        <>
          <Area
            y0={y.percentile10.get}
            y1={y.percentile90.get}
            fill={color}
            opacity="0.07"
            curve={curve}
          />
          {gradient && (
            <>
              <Area
                y0={y.percentile20.get}
                y1={y.percentile80.get}
                fill={color}
                opacity="0.07"
                curve={curve}
              />
              <Area
                y0={y.percentile30.get}
                y1={y.percentile70.get}
                fill={color}
                opacity="0.07"
                curve={curve}
              />
              <Area
                y0={y.percentile40.get}
                y1={y.percentile60.get}
                fill={color}
                opacity="0.07"
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
        </>
      )}
      <Line y={expected(y).get} stroke={color} curve={curve} />
    </>
  );
}

export function DistributionLine({points = true, ...props}) {
  const {color, y} = props;
  return (
    <>
      <ContainmentSplit>
        <DistributionLineContents {...props} />
      </ContainmentSplit>
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
