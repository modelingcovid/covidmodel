import * as React from 'react';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';

export const NearestMarker = () => {
  const {x} = useGraphData();
  const nearest = useNearestData();
  return <VMarker value={x(nearest())} />;
};
