import * as React from 'react';

import {getScenarioSummary} from '../../lib/controls';
import {InlineData} from '../content';
import {useModelState} from './useModelState';

export function CurrentScenario({width}) {
  const {scenarioData} = useModelState();
  return (
    <InlineData width={width}>
      {() => getScenarioSummary(scenarioData())}
    </InlineData>
  );
}
