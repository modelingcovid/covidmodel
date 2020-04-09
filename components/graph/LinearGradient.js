import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useComponentId} from '../util';

const {createContext, useContext} = React;

const GradientContext = createContext('up');

export const LinearGradient = ({
  children,
  direction = 'up',
  size,
  from,
  id,
  to,
  ...props
}) => {
  const x1 = direction === 'left' ? size : 0;
  const x2 = direction === 'right' ? size : 0;
  const y1 = direction === 'up' ? size : 0;
  const y2 = direction === 'down' ? size : 0;
  return (
    <GradientContext.Provider value={direction}>
      <defs>
        <linearGradient
          id={id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          gradientUnits="userSpaceOnUse"
        >
          {from && <stop offset={0} stopColor={from} />}
          {children}
          {to && <stop offset={1} stopColor={to} />}
        </linearGradient>
      </defs>
    </GradientContext.Provider>
  );
};

const useOffset = (offset) => {
  const direction = useContext(GradientContext);
  switch (direction) {
    case 'up':
      return 1 - offset;
    case 'down':
      return offset;
    case 'left':
      return 1 - offset;
    case 'right':
      return offset;
    default:
      return offset;
  }
};

export const Stop = ({offset, ...props}) => {
  const computed = useOffset(offset);
  return <stop {...props} offset={computed} />;
};
