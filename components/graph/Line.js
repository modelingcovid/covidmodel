import * as React from 'react';
import {LinePath} from '../path';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';

const {useCallback} = React;

const NearestCircle = ({y, ...remaining}) => {
  const nearest = useNearestPoint(y);
  return (
    nearest && <circle cx={nearest.x} cy={nearest.y} r="2.5" {...remaining} />
  );
};

export const Line = ({y, stroke, strokeWidth = 1.5, ...remaining}) => {
  const {data, x, xScale, yScale} = useGraphData();
  const xFn = useCallback((d) => xScale(x(d)), [x, xScale]);
  const yFn = useCallback((d) => yScale(y(d)), [y, yScale]);

  return (
    <>
      <LinePath
        {...remaining}
        data={data}
        x={xFn}
        y={yFn}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <NearestCircle y={y} fill={stroke} />
    </>
  );
};
