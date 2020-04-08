import * as React from 'react';
import {theme} from '../styles';
import {Grid, Paragraph} from './content';
import {Area, Graph, Legend, Line} from './graph';
import {People, SkullCrossbones, HeadSideCough} from './icon';
import {
  DistancingGradient,
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {getLastDate} from '../lib/date';
import {
  formatDate,
  formatNumber,
  formatLargeNumber,
  formatPercent1,
} from '../lib/format';
import {stackAccessors} from '../lib/stack';

const {useMemo} = React;

const getSusceptible = ({susceptible}) => susceptible;
const getCurrentlyInfected = ({currentlyInfected}) => currentlyInfected;
const getCurrentlyInfectious = ({currentlyInfectious}) => currentlyInfectious;
const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;
const getCumulativeRecoveries = ({cumulativeRecoveries}) =>
  cumulativeRecoveries;

const getExpected = (y) => (d) => y(d).expected;
const getConfirmed = (y) => (d) => y(d).confirmed;
const getCumulativeDeathsConfirmed = getConfirmed(getCumulativeDeaths);

const config = [
  {
    y: getCumulativeRecoveries,
    label: 'Recovered',
    description: 'People who have recovered from COVID-19',
    color: theme.color.gray[3],
  },
  {
    y: getCurrentlyInfected,
    label: 'Exposed',
    description:
      'People who have been infected with COVID-19 but cannot yet infect others',
    color: theme.color.yellow[2],
  },
  {
    y: getCurrentlyInfectious,
    label: 'Infectious',
    description: 'People who have COVID-19 and can infect others',
    color: theme.color.blue[2],
  },
  {
    y: getCumulativeDeaths,
    label: 'Deceased',
    description: 'People who have died from COVID-19',
    color: theme.color.magenta[1],
  },
];

const accessors = stackAccessors(config.map(({y}) => getExpected(y)));
config.forEach((c, i) => (c.area = accessors[i]));

const midAccessor = accessors[1][1];

const susceptible = {
  y: getSusceptible,
  label: 'Susceptible',
  description: 'People who have not yet contracted COVID-19',
  color: 'transparent',
};

export function SEIR({height, width}) {
  const {
    allTimeSeriesData,
    model,
    stateName,
    summary,
    timeSeriesData,
    x,
  } = useModelData();
  const midDomain = useMemo(
    () => Math.max(...allTimeSeriesData.map(midAccessor)),
    [allTimeSeriesData]
  );

  const percentInfected = summary.totalProjectedInfected / model.population;
  return (
    <div className="margin-top-5">
      <div className="section-heading">SEIR</div>
      <Paragraph>
        The model evaluated here is a standard epidemiological model called
        SEIR. It models the spread of a virus in four states:
      </Paragraph>
      <ul className="paragraph list-disc list-inside">
        <li>Susceptible (healthy, non-immune people)</li>
        <li>Exposed (infected, but cannot infect others)</li>
        <li>Infectious</li>
        <li>Recovered (or deceased)</li>
      </ul>
      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={People}
          value={formatNumber(model.population)}
          label="Total population"
          method="input"
        />
        <MethodDefinition
          icon={HeadSideCough}
          value={formatPercent1(
            summary.totalProjectedInfected / model.population
          )}
          label="Percentage of the population infected"
          method="modeled"
        />
        <MethodDefinition
          icon={SkullCrossbones}
          value={formatPercent1(
            summary.totalProjectedDeaths / model.population
          )}
          label="Fatality rate of the population"
          method="modeled"
        />
      </Grid>
      <Graph
        data={timeSeriesData}
        domain={midDomain}
        initialScale="linear"
        height={height}
        width={width}
        x={x}
        xLabel="people"
        after={
          <Legend>
            <PercentileLegendRow
              y={susceptible.y}
              title={susceptible.label}
              description={susceptible.description}
            />
            {config.map(({y, color, label, description}, i) => (
              <PercentileLegendRow
                key={i}
                y={y}
                color={color}
                title={label}
                description={description}
              />
            ))}
          </Legend>
        }
      >
        <DistancingGradient />
        {config.map(({area: [y0, y1], color}, i) => (
          <Area key={`area-${i}`} y0={y0} y1={y1} fill={color} opacity="0.15" />
        ))}
        {config.map(({area: [y0, y1], color}, i) => (
          <Line key={`line-${i}`} y={y1} stroke={color} />
        ))}
      </Graph>
    </div>
  );
}
