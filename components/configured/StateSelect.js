import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export function StateSelect({
  label = 'Location',
  states,
  placeholder = 'Choose a location…',
  ...props
}) {
  const {
    query: {state},
  } = useRouter();
  const navigateToLocation = useNavigateToLocation();
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={state || null}
      values={states}
      valueToString={stateLabels}
      onChange={navigateToLocation}
      {...props}
    />
  );
}
