import * as React from 'react';
import {interpolateBlues} from 'd3-scale-chromatic';
import {LinearGradient, Stop, useGraphData} from './graph';

export const DistancingGradient = ({id, y, color = interpolateBlues}) => {
  const {data, x, xScale, yScale, xMax, yMax} = useGraphData();
  return (
    <>
      <LinearGradient id={id} direction="right">
        {data.map((d, i) => (
          <Stop
            key={i}
            offset={x(d)}
            stopColor={color(yScale(y(d)) / yMax)}
            style={{transition: '400ms'}}
          />
        ))}
      </LinearGradient>
      <rect
        x="0"
        y="0"
        width={xMax}
        height={yMax}
        fill={`url(#${id})`}
        style={{opacity: '0.2'}}
      />
    </>
  );
};
