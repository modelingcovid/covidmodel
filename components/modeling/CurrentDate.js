import * as React from 'react';

import {InlineData} from '../content';
import {useNearestData} from '../graph';
import {useModelState} from './useModelState';
import {formatShortDate} from '../../lib/format';

export function CurrentDate({format = formatShortDate, length = 11}) {
  const nearest = useNearestData();
  const {x} = useModelState();
  return (
    <InlineData length={length}>
      {() => <span className="nowrap">{format(x(nearest()))}</span>}
    </InlineData>
  );
}
