import * as React from 'react';
import {theme} from '../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from './content';
import {Graph, Line} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  DistributionSeriesFullFragment,
  Estimation,
  MethodDefinition,
  SeriesFullFragment,
  createDistributionSeries,
  createSeries,
  useLocationData,
  useModelState,
} from './modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];

export const ICU = ({width, height}) => {
  const {location, indices, x} = useModelState();
  const {
    currentlyCritical,
    cumulativeCritical,
    domain,
    icuBeds,
  } = useLocationData();

  return (
    <div className="margin-top-5">
      <Title>ICU</Title>
      <Graph
        data={indices}
        domain={domain.critical.currently}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <Line y={icuBeds} stroke={red} strokeDasharray="6,3" />
            <DistributionLine y={currentlyCritical} color={blue} />
          </>
        )}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Currently require intensive care"
          y={currentlyCritical}
          color={blue}
          format={formatNumber}
        />
      </Gutter>
      <Graph
        data={indices}
        domain={domain.critical.cumulative}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine y={cumulativeCritical} color={blue} />
          </>
        )}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Total cases that require intensive care"
          y={cumulativeCritical}
          color={blue}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
