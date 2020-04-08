import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {Grid, Heading, Paragraph, Title, UnorderedList} from './content';
import {Area, Graph, Legend, Line, WithGraphData} from './graph';
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
    y: getSusceptible,
    label: 'Susceptible',
    description: 'People who have not yet contracted COVID-19',
    fill: theme.color.magenta[1],
    color: theme.color.magenta[1],
  },
  {
    y: getCumulativeRecoveries,
    label: 'Recovered',
    description: 'People who have recovered from COVID-19',
    fill: theme.color.gray[3],
    color: theme.color.gray[5],
  },
  {
    y: getCurrentlyInfected,
    label: 'Exposed',
    description:
      'People who have been infected with COVID-19 but cannot yet infect others',
    fill: theme.color.yellow[2],
    color: theme.color.yellow[3],
  },
  {
    y: getCurrentlyInfectious,
    label: 'Infectious',
    description: 'People who have COVID-19 and can infect others',
    fill: theme.color.blue[2],
    color: theme.color.blue[2],
  },
  {
    y: getCumulativeDeaths,
    label: 'Deceased',
    description: 'People who have died from COVID-19',
    fill: theme.color.red[2],
    color: theme.color.red[2],
  },
];

const byLabel = config.reduce((o, c) => {
  o[c.label.toLowerCase()] = c;
  return o;
}, {});

const accessors = stackAccessors(config.map(({y}) => getExpected(y)));
config.forEach((c, i) => (c.area = accessors[i]));

const midAccessor = accessors[2][1];

function Inline({children, color, fill}) {
  return (
    <span
      style={{
        fontFamily: theme.font.family.ui,
        fontWeight: 500,
        color,
      }}
    >
      {children}
      <span
        style={{
          display: 'inline-block',
          background: fill,
          height: 8,
          width: 8,
          margin: `0 ${theme.spacing[0]}`,
          borderRadius: 8,
          verticalAlign: 'middle',
        }}
      />
    </span>
  );
}

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
      <Title className="margin-bottom-3">Projections</Title>
      <Paragraph>
        Our model is based upon a standard epidemiological model called{' '}
        <strong>the SEIR model</strong>. The SEIR model is a{' '}
        <strong>compartmental model</strong>, which estimates the spread of a
        virus by dividing the population into different groups:
      </Paragraph>
      <UnorderedList>
        <li>
          <Inline {...byLabel.susceptible}>Susceptible people</Inline> are
          healthy and at risk for contracting COVID-19.
        </li>
        <li>
          <Inline {...byLabel.exposed}>Exposed people</Inline> have COVID-19 and
          are in the incubation period; they cannot infect others.
        </li>
        <li>
          <Inline {...byLabel.infectious}>Infectious people</Inline> have
          COVID-19 and can infect others.
        </li>
        <li>
          <Inline {...byLabel.recovered}>Recovered people</Inline> have had
          COVID-19 and are immune to re-infection.
        </li>
        <li>
          <Inline {...byLabel.deceased}>Deceased people</Inline> have passed
          away due to COVID-19.
        </li>
      </UnorderedList>
      {/* <Grid className="margin-bottom-3">
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
      </Grid> */}
      <div className="relative">
        <div
          style={{
            position: 'absolute',
            top: theme.spacing[2],
            right: theme.spacing[1],
            background: theme.color.background,
            zIndex: 2,
            boxShadow: `0 0 4px ${theme.color.gray[2]}`,
          }}
        >
          <Graph
            data={timeSeriesData}
            domain={model.population * 1.05}
            initialScale="linear"
            height={height / 4}
            width={width / 8}
            x={x}
            xLabel="people"
            scrubber={false}
            decoration={false}
          >
            {config.map(({area: [y0, y1], fill}, i) => (
              <Area
                key={`area-${i}`}
                y0={y0}
                y1={y1}
                fill={fill}
                opacity="0.15"
              />
            ))}
            {config.map(({area: [y0, y1], fill}, i) => (
              <Line key={`line-${i}`} y={y1} stroke={fill} />
            ))}
            <WithGraphData>
              {({xMax, yMax, yScale}) => {
                const midY = yScale(midDomain);
                const strokeWidth = 1;
                return (
                  <rect
                    x="0"
                    y={midY}
                    width={xMax - strokeWidth}
                    height={yMax - midY - strokeWidth}
                    // fill="transparent"
                    fill={theme.color.shadow[1]}
                    stroke={theme.color.gray[4]}
                    strokeWidth={strokeWidth}
                  />
                );
              }}
            </WithGraphData>
          </Graph>
        </div>
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
              {config.map(({y, fill, label, description}, i) => (
                <PercentileLegendRow key={i} y={y} color={fill} title={label} />
              ))}
            </Legend>
          }
        >
          <DistancingGradient />
          {config.map(({area: [y0, y1], fill}, i) => (
            <Area
              key={`area-${i}`}
              y0={y0}
              y1={y1}
              fill={fill}
              opacity="0.15"
            />
          ))}
          {config.map(({area: [y0, y1], fill}, i) => (
            <Line key={`line-${i}`} y={y1} stroke={fill} />
          ))}
        </Graph>
      </div>
    </div>
  );
}
