import * as React from 'react';

import {formatDate} from '../../lib/format';
import {InlineData} from '../content';
import {useLocationData} from './useLocationData';
import {useTodayDistancing} from './useTodayDistancing';

export function DateModelRun({length = 12, format = formatDate}) {
  const {dateModelRun} = useLocationData();
  return (
    <InlineData length={length}>
      {() => format(new Date(dateModelRun()))}
    </InlineData>
  );
}
