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

const HospitalizationsScenarioFragment = [
  ...SeriesFullFragment,
  ...DistributionSeriesFullFragment,
  `fragment HospitalizationsScenario on Scenario {
    currentlyHospitalized { ...DistributionSeriesFull }
    currentlyReportedHospitalized { ...DistributionSeriesFull }
    cumulativeHospitalized { ...DistributionSeriesFull }
    cumulativeReportedHospitalized { ...DistributionSeriesFull }
    hospitalCapacity {...SeriesFull}
  }`,
];

const useDomains = () => {
  const [data, error] = useLocationQuery(`{
    domain {
      currentlyHospitalized { expected { max } }
      cumulativeHospitalized { expected { max } }
    }
  }`);
  const domains = useMemo(() => {
    if (!data) {
      return {};
    }
    const {domain} = data;
    return {
      currentDomain: domain.currentlyHospitalized.expected.max,
      cumulativeDomain: domain.cumulativeHospitalized.expected.max,
    };
  });
  return [domains, error];
};

export const Hospitalizations = ({width, height}) => {
  const {location, indices, distancingIndices, x} = useModelState();

  const [scenario] = useScenarioQuery(
    `{ ...HospitalizationsScenario }`,
    HospitalizationsScenarioFragment
  );
  const hospitalCapacity = createSeries(scenario?.hospitalCapacity);
  const currentlyHospitalized = createDistributionSeries(
    scenario?.currentlyHospitalized
  );
  const currentlyReportedHospitalized = createDistributionSeries(
    scenario?.currentlyReportedHospitalized
  );
  const cumulativeHospitalized = createDistributionSeries(
    scenario?.cumulativeHospitalized
  );
  const cumulativeReportedHospitalized = createDistributionSeries(
    scenario?.cumulativeReportedHospitalized
  );

  const [{currentDomain = 2000, cumulativeDomain = 1000000}] = useDomains();

  return (
    <div className="margin-top-5">
      <Title>Hospitalizations</Title>
      <Paragraph>
        We estimate the hospital capacity for COVID-19 patients by taking the
        number of available beds and discounting for that hospital system’s
        typical occupancy rate.
      </Paragraph>
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
        <Line y={hospitalCapacity} stroke={red} strokeDasharray="6,3" />
        <DistributionLine y={currentlyHospitalized} color={blue} />
        <DistributionLine y={currentlyReportedHospitalized} color={yellow} />
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Currently hospitalized"
          y={currentlyHospitalized}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently reported hospitalized"
          y={currentlyReportedHospitalized}
          color={yellow}
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
        <DistributionLine y={cumulativeHospitalized} color={blue} />
        <DistributionLine y={cumulativeReportedHospitalized} color={yellow} />
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Total hospitalized"
          y={cumulativeHospitalized}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Total reported hospitalized"
          y={cumulativeReportedHospitalized}
          color={yellow}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
