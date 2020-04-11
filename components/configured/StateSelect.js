import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {useCurrentLocation} from './useCurrentLocation';
import {useLocations} from '../modeling';

const {useMemo} = React;

export function StateSelect({
  label = 'Location',
  placeholder = 'Choose a location…',
  ...props
}) {
  const [locations] = useLocations();
  const locationId = useCurrentLocation();
  const navigateToLocation = useNavigateToLocation();
  const ids = useMemo(() => locations.map(({id}) => id), [locations]);
  const nameMap = useMemo(
    () =>
      locations.reduce((o, {id, name}) => {
        o[id] = name;
        return o;
      }, {}),
    [locations]
  );
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
