import * as React from 'react';
import {LinearGradient as VxLinearGradient} from '@vx/gradient';
import {useComponentId, useGraphData} from './util';

export const LinearGradient = ({children, from, id, to, ...props}) => {
  const {yMax} = useGraphData();
  return (
    <VxLinearGradient
      x2="0"
      x1="0"
      y1={yMax}
      y2="0"
      gradientUnits="userSpaceOnUse"
      id={id}
    >
      {from && <stop offset={0} stopColor={from} />}
      {children}
      {to && <stop offset={1} stopColor={to} />}
    </VxLinearGradient>
  );
};
