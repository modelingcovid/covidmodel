import * as React from 'react';
import {VMarker} from './Marker';
import {useContainmentStrategy, useLocationData} from '../modeling';
import {theme} from '../../styles';

export function ContainmentMarker() {
  const {dateContained} = useLocationData();
  const strategy = useContainmentStrategy();
  if (strategy === 'none') {
    return null;
  }
  return (
    <VMarker
      value={new Date(dateContained())}
      stroke={theme.color.magenta[0]}
      strokeDasharray="4,2"
      label="Test and trace begins"
      labelAnchor="end"
      labelDx={-4}
      labelDy={16}
    />
  );
}
