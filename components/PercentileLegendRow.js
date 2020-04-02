import * as React from 'react';
import {useNearestData} from './graph';
import {LegendEntry, LegendRow} from './Legend';
import {formatNumber, formatNA} from '../lib/format';

export const PercentileLegendRow = ({
  children,
  description,
  format = formatNumber,
  color,
  hasConfirmed = false,
  title,
  y,
}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }
  const {confirmed, percentile10, percentile50, percentile90} = y(d);
  return (
    <LegendRow title={title} description={description}>
      <LegendEntry
        label="Projected"
        color={color}
        format={format}
        y={(d) => y(d).percentile50}
      />
      {hasConfirmed && (
        <LegendEntry
          label="Confirmed"
          color={color}
          symbol="stroke"
          y={(d) => y(d).confirmed}
          format={formatNA(format)}
        />
      )}
    </LegendRow>
  );
};
