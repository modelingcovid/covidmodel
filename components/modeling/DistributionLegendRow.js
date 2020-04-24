import * as React from 'react';
import {LegendEntry, LegendRow} from '../graph';
import {useSuspense} from '../util';
import {useExpected, useModelState} from '../modeling';
import {formatNumber, formatNA} from '../../lib/format';

const {useMemo} = React;

export const DistributionLegendRow = ({
  children,
  description,
  format = formatNumber,
  color,
  title,
  y,
  compact = false,
}) => {
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
      />
    );
  }
  return (
    <LegendRow label={title}>
      <LegendEntry
        label="Modeled"
        color={color}
        format={format}
        y={expected(y).get}
      />
      {hasConfirmed && (
        <LegendEntry
          label="Confirmed"
          color={color}
          symbol="stroke"
          y={y.confirmed.get}
          format={formatNA(format)}
        />
      )}
    </LegendRow>
  );
};
