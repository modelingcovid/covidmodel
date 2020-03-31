import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';

const {useMemo} = React;

export const useNearestCoordinates = (y) => {
  const {x, xScale, yScale} = useGraphData();
  const nearest = useNearestPoint();
  return useMemo(() => {
    if (!nearest) {
      return null;
    }
    return {
      data: nearest,
      x: xScale(x(nearest)),
      y: y ? yScale(y(nearest)) : 0,
    };
  }, [nearest, x, y, xScale, yScale]);
};

export const WithNearestCoordinates = ({children, y}) =>
  children(useNearestCoordinates(y));
