import * as React from 'react';
import {LegendEntry, LegendRow, useGraphData, useNearestData} from '../graph';
import {formatNumber, formatNA} from '../../lib/format';

const {useMemo} = React;
const getExpectedOr50 = (d) => d.expected || d.percentile50;

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
  return (
    <LegendRow title={title} description={description}>
      <LegendEntry
        label="Modeled"
        color={color}
        format={format}
        y={(d) => getExpectedOr50(y(d))}
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
