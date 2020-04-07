import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {useCurrentLocation} from './useCurrentLocation';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export function StateSelect({
  label = 'Location',
  states,
  placeholder = 'Choose a location…',
  ...props
}) {
  const state = useCurrentLocation();
  const navigateToLocation = useNavigateToLocation();
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={state}
      values={states}
      valueToString={stateLabels}
      onChange={navigateToLocation}
      {...props}
    />
  );
}
