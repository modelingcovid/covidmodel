import * as React from 'react';
import {LinePath} from '../path';
import {useGraphData} from './useGraphData';

const {useCallback} = React;

export const Line = ({y, stroke = 'blue', strokeWidth = 1.5, ...remaining}) => {
  const {data, x, xScale, yScale} = useGraphData();
  const xFn = useCallback((d) => xScale(x(d)), [x, xScale]);
  const yFn = useCallback((d) => yScale(y(d)), [y, yScale]);

  return (
    <LinePath
      {...remaining}
      data={data}
      x={xFn}
      y={yFn}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};
