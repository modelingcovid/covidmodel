import * as React from 'react';
import {useGraphData} from './useGraphData';

export function ClipPathX({left, right, value}) {
  const {xScale, xMax, yMax} = useGraphData();
  const xPosition = xScale(value);
  return (
    <defs>
      {left && (
        <clipPath id={left}>
          <rect x="0" y="0" width={xPosition} height={yMax} />
        </clipPath>
      )}
      {right && (
        <clipPath id={right}>
          <rect x={xPosition} y="0" width={xMax - xPosition} height={yMax} />
        </clipPath>
      )}
    </defs>
  );
}
