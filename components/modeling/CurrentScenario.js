import * as React from 'react';

import {formatScenario} from '../../lib/controls';
import {InlineData} from '../content';
import {useModelState} from './useModelState';
import {useTodayDistancing} from './useTodayDistancing';

export function CurrentScenario({length = 20, format = formatScenario}) {
  const {scenarioData} = useModelState();
  return (
    <InlineData length={length}>{() => format(scenarioData())}</InlineData>
  );
}
