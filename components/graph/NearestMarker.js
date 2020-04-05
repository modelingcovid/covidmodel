import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';

export const NearestMarker = () => {
  const {x} = useGraphData();
  const nearest = useNearestData();
  if (!nearest) {
    return null;
  }
  return (
    <VMarker value={x(nearest)} stroke="var(--color-gray2)" strokeWidth={1} />
  );
};
