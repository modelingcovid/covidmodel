import * as React from 'react';
import {useFindPoint} from './useFindPoint';
import {useLocationData} from './useLocationData';
import {today} from '../../lib/date';

const {useCallback} = React;

export function useTodayDistancing() {
  const {distancing} = useLocationData();
  const findPoint = useFindPoint();
  return useCallback(() => {
    const todayIndex = findPoint(today);
    return distancing(todayIndex);
  }, [distancing, findPoint]);
}
