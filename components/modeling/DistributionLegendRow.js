import * as React from 'react';
import {LegendEntry, LegendRow} from '../graph';
import {useModelState} from '../modeling';
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
  const {indices} = useModelState();
  const hasConfirmed = useMemo(
    () => indices.some((...d) => y && y.confirmed(...d)),
    [indices, y]
  );

  if (!y) {
    return null;
  }

  if (compact && !hasConfirmed) {
    return (
      <LegendRow label={title} color={color} format={format} y={y.expected} />
    );
  }
  return (
    <LegendRow label={title}>
      <LegendEntry
        label="Modeled"
        color={color}
        format={format}
        y={y.expected}
      />
      {hasConfirmed && (
        <LegendEntry
          label="Confirmed"
          color={color}
          symbol="stroke"
          y={y.confirmed}
          format={formatNA(format)}
        />
      )}
    </LegendRow>
  );
};
