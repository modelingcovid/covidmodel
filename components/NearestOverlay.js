import * as React from 'react';
import {useGraphData, useNearestPoint} from './util';
import {formatDate} from '../lib/date';

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
