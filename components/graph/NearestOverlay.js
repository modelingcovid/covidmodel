import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';
import {formatDate} from '../../lib/date';

export const NearestOverlay = ({children}) => {
  const {x} = useGraphData();
  const nearest = useNearestPoint();
  if (!nearest) {
    return null;
  }
  return (
    <div style={{transform: `translateX(${x(nearest)}px)`}}>{children}</div>
  );
};
