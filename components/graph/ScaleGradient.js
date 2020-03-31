import * as React from 'react';
import {interpolateBlues} from 'd3-scale-chromatic';
import {LinearGradient, Stop} from './LinearGradient';
import {useGraphData} from './useGraphData';
import {useComponentId} from '../util';

export const ScaleGradient = ({
  id,
  y,
  yScale: yScaleProp,
  color = interpolateBlues,
}) => {
  const {data, x, yScale: yScaleContext, yMax} = useGraphData();
  if (yScaleProp) {
    yScaleProp.range([yMax, 0]);
  }
  const yScale = yScaleProp || yScaleContext;
  return (
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
  );
};

export const ScaleGradientLayer = ({
  y,
  yScale,
  color = interpolateBlues,
  ...props
}) => {
  const {xMax, yMax} = useGraphData();
  const id = useComponentId('scaleGradientLayer');
  return (
    <>
      <ScaleGradient
        color={color}
        id={id}
        direction="right"
        y={y}
        yScale={yScale}
      />
      <rect
        {...props}
        x="0"
        y="0"
        width={xMax}
        height={yMax}
        fill={`url(#${id})`}
      />
    </>
  );
};
