import * as React from 'react';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export function StateSelect({state, states, ...props}) {
  const navigateToLocation = useNavigateToLocation();
  return (
    <Select
      label="Location"
      placeholder="Choose a location…"
      value={state}
      values={states}
      valueToString={stateLabels}
      onChange={navigateToLocation}
      {...props}
    />
  );
}
