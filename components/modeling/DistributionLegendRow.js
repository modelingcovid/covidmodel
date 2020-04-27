import * as React from 'react';
import {LegendEntry, LegendRow} from '../graph';
import {useSuspense} from '../util';
import {useExpected, useModelState} from '../modeling';
import {formatNumber, formatNA} from '../../lib/format';

const {useMemo} = React;

const identity = (x) => x;

export function ExpectedLegendEntry({y, ...props}) {
  const expected = useExpected();
  return <LegendEntry {...props} y={expected(y).get} />;
}

export function DistributionLegendRow({
  after,
  before,
  description,
  format = formatNumber,
  color,
  title,
  y,
  compact = false,
  formatLabel = identity,
}) {
  const suspense = useSuspense();
  const expected = useExpected();
  const hasConfirmed = suspense(() => y.confirmed.empty() === false, false);
  if (compact) {
    return (
      <LegendRow
        label={title}
        color={color}
        format={format}
        y={expected(y).get}
      >
        {before}
        {after}
      </LegendRow>
    );
  }
  return (
    <LegendRow label={title}>
      {before}
      <LegendEntry
        label={formatLabel('Modeled')}
        color={color}
        format={format}
        y={expected(y).get}
      />
      {hasConfirmed && (
        <LegendEntry
          label={formatLabel('Confirmed')}
          color={color}
          mode="stroke"
          y={y.confirmed.get}
          format={formatNA(format)}
        />
      )}
      {after}
    </LegendRow>
  );
}
