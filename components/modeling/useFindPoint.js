import * as React from 'react';
import {useModelData} from './useModelData';
import {findPoint} from '../../lib/transform';

const {useMemo} = React;

export function useFindPoint() {
  const {timeSeriesData, x} = useModelData();
  return useMemo(() => findPoint(timeSeriesData, x), [timeSeriesData, x]);
}
