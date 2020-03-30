import * as React from 'react';
import {useGraphData} from './useGraphData';

const {useCallback} = React;

export const Points = ({y, fill = 'transparent', r = 1.25, ...remaining}) => {
  const {data, x, xScale, yScale} = useGraphData();
  return (
    <>
      {data.map((d, i) => {
        const yVal = y(d);
        // Only show points with data
        if (!yVal) {
          return;
        }
        return (
          <circle
            {...remaining}
            key={i}
            fill={fill}
            cx={xScale(x(d))}
            cy={yScale(yVal)}
            r={r}
          />
        );
      })}
    </>
  );
};
