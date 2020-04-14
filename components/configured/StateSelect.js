import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {useCurrentLocation} from './useCurrentLocation';
import {useLocationDropdownState} from './useLocationDropdownState';

const {useMemo} = React;

export function StateSelect({
  label = 'Location',
  placeholder = 'Choose a location…',
  ...props
}) {
  const [ids, nameMap] = useLocationDropdownState();
  const locationId = useCurrentLocation();
  const navigateToLocation = useNavigateToLocation();
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={locationId}
      values={ids}
      valueToString={nameMap}
      onChange={navigateToLocation}
      {...props}
    />
  );
}
