import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Menu} from '../Menu';
import {useCurrentLocation} from './useCurrentLocation';
import {useLocationDropdownState} from './useLocationDropdownState';
import {DownArrow} from '../icon';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export const LocationMenu = React.memo(function LocationMenu({
  children,
  ...props
}) {
  const [ids, nameMap] = useLocationDropdownState();
  const location = useCurrentLocation();
  const navigateToLocation = useNavigateToLocation();
  return (
    <Menu
      value={location || null}
      values={ids}
      valueToString={nameMap}
      onChange={navigateToLocation}
      anchor="end"
      {...props}
    >
      {children ? (
        children
      ) : (
        <span>
          Location
          <DownArrow
            style={{
              whiteSpace: 'nowrap',
              display: 'inline',
              marginLeft: '2px',
              marginRight: '-4px',
              marginTop: '1px',
            }}
          />
        </span>
      )}
    </Menu>
  );
});
