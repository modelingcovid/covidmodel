import * as React from 'react';
import {theme} from '../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  DistributionSeriesFullFragment,
  Estimation,
  MethodDefinition,
  createDistributionSeries,
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

const color = theme.color.red[1];
const textColor = theme.color.red.text;

const HospitalizationsScenarioFragment = [
  ...DistributionSeriesFullFragment,
  `fragment HospitalizationsScenario on Scenario {
    currentlyHospitalized { ...DistributionSeriesFull }
    currentlyReportedHospitalized { ...DistributionSeriesFull }
    cumulativeHospitalized { ...DistributionSeriesFull }
    cumulativeReportedHospitalized { ...DistributionSeriesFull }
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
  const {
    location,
    scenario: {distancingDays, distancingLevel},
    indices,
    distancingIndices,
    x,
  } = useModelState();

  const [scenario] = useScenarioQuery(
    `{ ...HospitalizationsScenario }`,
    HospitalizationsScenarioFragment
  );
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
        after={
          <Gutter>
            <DistributionLegendRow
              title="Currently hospitalized"
              y={currentlyHospitalized}
              color={color}
              format={formatNumber}
            />
            <DistributionLegendRow
              title="Currently reported hospitalized"
              y={currentlyReportedHospitalized}
              color={color}
              format={formatNumber}
            />
          </Gutter>
        }
      >
        <DistributionLine y={currentlyHospitalized} color={color} />
        <DistributionLine y={currentlyReportedHospitalized} color={color} />
      </Graph>
      <Graph
        data={indices}
        domain={cumulativeDomain}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
        after={
          <Gutter>
            <DistributionLegendRow
              title="Total hospitalized"
              y={cumulativeHospitalized}
              color={color}
              format={formatNumber}
            />
            <DistributionLegendRow
              title="Total reported hospitalized"
              y={cumulativeReportedHospitalized}
              color={color}
              format={formatNumber}
            />
          </Gutter>
        }
      >
        <DistributionLine y={cumulativeHospitalized} color={color} />
        <DistributionLine y={cumulativeReportedHospitalized} color={color} />
      </Graph>
    </div>
  );
};
