import * as React from 'react';
import {LegendEntry, LegendRow, useGraphData, useNearestData} from '../graph';
import {formatNumber, formatNA} from '../../lib/format';

const {useMemo} = React;

export const PercentileLegendRow = ({
  children,
  description,
  format = formatNumber,
  color,
  title,
  y,
}) => {
  const {data} = useGraphData();
  const hasConfirmed = useMemo(() => data.some((d) => !!y(d).confirmed), [
    data,
    y,
  ]);

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
