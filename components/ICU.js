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
  useModelState,
  useLocationQuery,
  useScenarioQuery,
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

const ICUScenarioFragment = [
  ...SeriesFullFragment,
  ...DistributionSeriesFullFragment,
  `fragment ICUScenario on Scenario {
    currentlyCritical { ...DistributionSeriesFull }
    cumulativeCritical { ...DistributionSeriesFull }
  }`,
];

const useDomains = () => {
  const [data, error] = useLocationQuery(`{
    icuBeds
    domain {
      currentlyCritical { expected { max } }
      cumulativeCritical { expected { max } }
    }
  }`);
  const domains = useMemo(() => {
    if (!data) {
      return {};
    }
    const {domain, icuBeds} = data;
    return {
      icuBeds: () => icuBeds,
      currentDomain: domain.currentlyCritical.expected.max,
      cumulativeDomain: domain.cumulativeCritical.expected.max,
    };
  });
  return [domains, error];
};

const defaultIcuBeds = () => 1000;

export const ICU = ({width, height}) => {
  const {location, indices, distancingIndices, x} = useModelState();

  const [scenario] = useScenarioQuery(
    `{ ...ICUScenario }`,
    ICUScenarioFragment
  );
  const currentlyCritical = createDistributionSeries(
    scenario?.currentlyCritical
  );
  const cumulativeCritical = createDistributionSeries(
    scenario?.cumulativeCritical
  );

  const [
    {
      currentDomain = 1000,
      cumulativeDomain = 1000000,
      icuBeds = defaultIcuBeds,
    },
  ] = useDomains();

  return (
    <div className="margin-top-5">
      <Title>ICU</Title>
      <Graph
        data={indices}
        domain={currentDomain}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        <Line y={icuBeds} stroke={red} strokeDasharray="6,3" />
        <DistributionLine y={currentlyCritical} color={blue} />
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
        domain={cumulativeDomain}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        <DistributionLine y={cumulativeCritical} color={blue} />
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
