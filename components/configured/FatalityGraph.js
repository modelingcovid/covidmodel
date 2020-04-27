import * as React from 'react';
import {theme} from '../../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from '../content';
import {Graph} from '../graph';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  useLocationData,
  useModelState,
} from '../modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
} from '../../lib/format';
import {getLastDate} from '../../lib/date';

const {useCallback, useMemo} = React;

const red = theme.color.red[1];
const redText = theme.color.red.text;

export function FatalityGraph({width, height}) {
  const {cumulativeDeaths, domain} = useLocationData();
  return (
    <Graph
      domain={domain.cumulativeDeaths}
      initialScale="linear"
      xLabel="people"
      width={width}
      height={height}
    >
      {() => (
        <DistributionLine y={cumulativeDeaths} color={red} mode="gradient" />
      )}
    </Graph>
  );
}
