import * as React from 'react';
import {useModelState} from './useModelState';
import {findPoint} from '../../lib/transform';

const {useMemo} = React;

export function useFindPoint() {
  const {indices, x} = useModelState();
  return useMemo(() => findPoint(indices, x), [indices, x]);
}
