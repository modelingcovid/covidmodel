import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';

const {useMemo} = React;

export const useNearestPoint = (y) => {
  const {x, xScale, yScale} = useGraphData();
  const nearest = useNearestData();
  return useMemo(() => {
    if (!nearest) {
      return null;
    }
    return {
      data: nearest,
      x: xScale(x(nearest())),
      y: y ? yScale(y(nearest())) : 0,
    };
  }, [nearest, x, y, xScale, yScale]);
};

export const WithNearestPoint = ({children, y}) => children(useNearestPoint(y));
