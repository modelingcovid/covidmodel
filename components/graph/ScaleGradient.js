import * as React from 'react';
import {LinearGradient, Stop} from './LinearGradient';
import {useGraphData} from './useGraphData';
import {useComponentId} from '../util';
import {maybe} from '../../lib/fn';

export const ScaleGradient = React.memo(function ScaleGradient({
  id,
  data,
  x,
  y,
  color,
  size,
}) {
  return (
    <LinearGradient id={id} direction="right" size={size}>
      {maybe(data).map((d, i) => (
        <Stop
          key={i}
          offset={x(d, i, data)}
          stopColor={color(y(d, i, data))}
          style={{transition: '400ms'}}
        />
      ))}
    </LinearGradient>
  );
});
