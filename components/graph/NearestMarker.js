import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';
import {formatDate} from '../../lib/date';

export const NearestMarker = () => {
  const {x} = useGraphData();
  const nearest = useNearestPoint();
  if (!nearest) {
    return null;
  }
  return <VMarker value={x(nearest)} stroke="#8691a1" strokeWidth={1} />;
};
