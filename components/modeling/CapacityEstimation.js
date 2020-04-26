import * as React from 'react';
import {Estimation} from './Estimation';
import {useModelState} from './useModelState';
import {InlineData} from '../content';
import {today} from '../../lib/date';
import {formatShortDate} from '../../lib/format';

const {useCallback} = React;

export function CapacityEstimation({date, subject}) {
  const {location} = useModelState();
  const getDate = useCallback(() => {
    const d = date();
    return d ? new Date(d) : null;
  }, [date]);
  return (
    <Estimation>
      The model estimates that {subject} in {location.name}{' '}
      <InlineData>
        {() => {
          const date = getDate();
          if (!date) {
            return 'will remain under';
          }
          if (date < today) {
            return 'exceeded';
          }
          return 'will exceed';
        }}
      </InlineData>{' '}
      capacity
      <InlineData>
        {() => {
          const date = getDate();
          return date && ` on ${formatShortDate(date)}`;
        }}
      </InlineData>
      .
    </Estimation>
  );
}
