import * as React from 'react';
import {useGraphData} from './useGraphData';

export const Stop = ({offset, ...props}) => {
  const {yMax, yScale} = useGraphData();
  return <stop {...props} offset={(yMax - yScale(offset)) / yMax} />;
};
