import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Menu} from '../Menu';
import {useCurrentLocation} from './useCurrentLocation';
import {DownArrow} from '../icon';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export function LocationMenu({children, states, ...props}) {
  const state = useCurrentLocation();
  const navigateToLocation = useNavigateToLocation();
  return (
    <Menu
      value={state || null}
      values={states}
      valueToString={stateLabels}
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
}
