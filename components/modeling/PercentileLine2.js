import * as React from 'react';
import {Area, Line, Points} from '../graph';
import {getDate} from '../../lib/date';
import {useDistributionQuery} from './query';

const compactFields = `
  expected
  confirmed
  percentile10
  percentile50
  percentile90
`;

const fullFields = `
  ${compactFields}
  percentile20
  percentile30
  percentile40
  percentile60
  percentile70
  percentile80
`;

export const PercentileLine2 = ({
  distribution,
  color = 'var(--color-blue2)',
  curve,
  gradient = false,
}) => {
  const [data] = useDistributionQuery(
    distribution,
    `{ ${gradient ? fullFields : compactFields} }`
  );
  console.log('GOT', data);
  if (!data) {
    return null;
  }
  return (
    <>
      {/* <Area
        y0={data.percentile10}
        y1={data.percentile90}
        fill={color}
        opacity="0.1"
        curve={curve}
      />
      {gradient && (
        <>
          <Area
            y0={data.percentile20}
            y1={data.percentile80}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={data.percentile30}
            y1={data.percentile70}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={data.percentile40}
            y1={data.percentile60}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
        </>
      )} */}
      <Line
        y={(_, i) => data.percentile50[i]}
        stroke={color}
        opacity="0.2"
        dot={false}
        curve={curve}
      />
      <Line y={(_, i) => data.expected[i]} stroke={color} curve={curve} />
      {/* <Points
        y={data.confirmed}
        stroke={color}
        strokeWidth={1.5}
        r={2}
        fill="var(--color-background)"
        nearestProps={() => ({r: 3.5})}
      /> */}
    </>
  );
};
