import * as React from 'react';
import {LinearGradient as VxLinearGradient} from '@vx/gradient';
import {useGraphData} from './useGraphData';
import {useComponentId} from '../util';

const {createContext, useContext} = React;

const GradientContext = createContext('up');

export const LinearGradient = ({
  children,
  direction = 'up',
  from,
  id,
  to,
  ...props
}) => {
  const {xMax, yMax} = useGraphData();
  const x1 = direction === 'left' ? xMax : 0;
  const x2 = direction === 'right' ? xMax : 0;
  const y1 = direction === 'up' ? yMax : 0;
  const y2 = direction === 'down' ? yMax : 0;
  return (
    <GradientContext.Provider value={direction}>
      <VxLinearGradient
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
        gradientUnits="userSpaceOnUse"
        id={id}
      >
        {from && <stop offset={0} stopColor={from} />}
        {children}
        {to && <stop offset={1} stopColor={to} />}
      </VxLinearGradient>
    </GradientContext.Provider>
  );
};

const useOffset = (offset) => {
  const direction = useContext(GradientContext);
  const {xMax, yMax, xScale, yScale} = useGraphData();
  switch (direction) {
    case 'up':
      return (yMax - yScale(offset)) / yMax;
    case 'down':
      return yScale(offset) / yMax;
    case 'left':
      return (xMax - xScale(offset)) / xMax;
    case 'right':
      return xScale(offset) / xMax;
    default:
      return offset;
  }
};

export const Stop = ({offset, ...props}) => {
  const computed = useOffset(offset);
  return <stop {...props} offset={computed} />;
};
