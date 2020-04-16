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

const ProjectedDeathsScenarioFragment = [
  ...DistributionSeriesFullFragment,
  `fragment ProjectedDeathsScenario on Scenario {
    dailyDeaths { ...DistributionSeriesFull }
  }`,
];

const useDomain = () => {
  const [data, error] = useLocationQuery(`{
    domain {
      dailyDeaths { expected { max } }
    }
  }`);
  if (!data) {
    return [data, error];
  }
  return [data.domain.dailyDeaths.expected.max, error];
};

export const ProjectedDeaths = ({width, height}) => {
  const {
    location,
    scenario: {distancingDays, distancingLevel},
    indices,
    distancingIndices,
    x,
  } = useModelState();

  const [scenario] = useScenarioQuery(
    `{ ...ProjectedDeathsScenario }`,
    ProjectedDeathsScenarioFragment
  );
  const dailyDeaths = createDistributionSeries(scenario?.dailyDeaths);

  const [domain = 2000] = useDomain();

  const peakWithinDistancing = useMemo(
    () =>
      distancingLevel !== 1 &&
      distancingIndices.reduce((prev, d) => {
        return prev != null &&
          dailyDeaths.expected(prev) >= dailyDeaths.expected(d)
          ? prev
          : d;
      }, null),
    [distancingLevel, distancingIndices, dailyDeaths]
  );

  return (
    <div className="margin-top-5">
      <Title>Finding the peak of the curve</Title>
      <Paragraph>
        Logarithmic scales and cumulative numbers can be difficult to observe by
        eye. We can get a better sense of the severity at any given point in
        time by looking at the{' '}
        <InlineLabel color={textColor} fill={color}>
          fatalities per day
        </InlineLabel>{' '}
        on a linear scale.
      </Paragraph>
      {peakWithinDistancing && (
        <Estimation date={false}>
          The peak number of fatalities per day before the end of the{' '}
          {formatMonths(distancingDays)}-month social distancing period in{' '}
          {location.name} is projected to occur on{' '}
          <strong className="nowrap">
            {formatShortDate(x(peakWithinDistancing))}
          </strong>
          .
        </Estimation>
      )}
      <Graph
        data={indices}
        domain={domain}
        initialScale="linear"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        <DistributionLine y={dailyDeaths} color={color} />
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Fatalities per day"
          y={dailyDeaths}
          color={color}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
