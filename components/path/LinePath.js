import * as React from 'react';
import {LinePath as VxLinePath} from '@vx/shape';
import {AnimatedPath} from './AnimatedPath';

export const LinePath = React.memo(function LinePath({
  curve,
  data,
  x,
  y,
  ...remaining
}) {
  return (
    <VxLinePath curve={curve} x={x} y={y}>
      {({path}) => <AnimatedPath {...remaining} d={path(data) || ''} />}
    </VxLinePath>
  );
});
