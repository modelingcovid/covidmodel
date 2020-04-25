import * as React from 'react';
import {useExpected} from './useContainmentStrategy';
import {useFindPoint} from './useFindPoint';
import {useLocationData} from './useLocationData';
import {today} from '../../lib/date';

const {useCallback} = React;

export function useTodayDistancing() {
  const expected = useExpected();
  const {distancing} = useLocationData();
  const findPoint = useFindPoint();
  return useCallback(() => {
    const todayIndex = findPoint(today);
    return expected(distancing).get(todayIndex);
  }, [distancing, findPoint]);
}
