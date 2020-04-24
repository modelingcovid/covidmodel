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
    <g opacity="0.5">
      <VMarker
        value={new Date(dateContained())}
        stroke={theme.color.magenta[1]}
        strokeDasharray="4,2"
        label="Test and trace"
        labelDx={4}
        labelDy={16}
      />
    </g>
  );
}
