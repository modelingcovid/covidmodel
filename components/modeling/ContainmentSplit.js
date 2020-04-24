import * as React from 'react';
import {ClipPathX} from '../graph';
import {useComponentId} from '../util';
import {
  ContainmentStrategyContext,
  useContainmentStrategy,
} from './useContainmentStrategy';
import {useLocationData} from './useLocationData';

const {useMemo} = React;

export function ContainmentSplit({children}) {
  const strategy = useContainmentStrategy();
  const {dateContained} = useLocationData();
  const value = useMemo(() => new Date(dateContained()), [dateContained]);
  const id = useComponentId('containment-split');

  if (strategy === 'none') {
    return children;
  }

  const left = `${id}-l`;
  const right = `${id}-r`;
  const filter = `${id}-f`;
  return (
    <>
      <ClipPathX left={left} right={right} value={value} />
      <defs>
        <filter id={filter}>
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <ContainmentStrategyContext.Provider value="none">
        <g clipPath={`url(#${left})`}>{children}</g>
        <g clipPath={`url(#${right})`} filter={`url(#${filter})`} opacity="0.3">
          {children}
        </g>
      </ContainmentStrategyContext.Provider>
      <g clipPath={`url(#${right})`}>{children}</g>
    </>
  );
}
