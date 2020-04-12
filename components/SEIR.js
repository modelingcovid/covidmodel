import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {
  Grid,
  Gutter,
  InlineLabel,
  Heading,
  Paragraph,
  Title,
  UnorderedList,
} from './content';
import {Area, Graph, Line, WithGraphData, WithNearestData} from './graph';
import {People, SkullCrossbones, HeadSideCough} from './icon';
import {
  DistributionLegendRow,
  Estimation,
  MethodDefinition,
  MethodDisclaimer,
  PercentileLine,
  useDistribution,
  useModelState,
  usePopulation,
} from './modeling';
import {getLastDate} from '../lib/date';
import {
  formatShortDate,
  formatNumber,
  formatLargeNumber,
  formatPercent1,
} from '../lib/format';
import {stackAccessors} from '../lib/stack';

const {useMemo} = React;

export function SEIR({height, width}) {
  const {location, indices, x} = useModelState();

  const [susceptible] = useDistribution('susceptible');
  const [currentlyInfected] = useDistribution('currentlyInfected');
  const [currentlyInfectious] = useDistribution('currentlyInfectious');
  const [cumulativeDeaths] = useDistribution('cumulativeDeaths');
  const [cumulativeRecoveries] = useDistribution('cumulativeRecoveries');

  const [population = 9000000] = usePopulation();

  const [config, byLabel, accessors] = useMemo(() => {
    const config = [
      {
        y: susceptible,
        label: 'Susceptible',
        description: 'People who have not yet contracted COVID-19',
        fill: theme.color.magenta[1],
        color: theme.color.magenta[1],
      },
      {
        y: cumulativeRecoveries,
        label: 'Recovered',
        description: 'People who have recovered from COVID-19',
        fill: theme.color.gray[3],
        color: theme.color.gray[5],
      },
      {
        y: currentlyInfected,
        label: 'Exposed',
        description:
          'People who have been infected with COVID-19 but cannot yet infect others',
        fill: theme.color.yellow[2],
        color: theme.color.yellow.text,
      },
      {
        y: currentlyInfectious,
        label: 'Infectious',
        description: 'People who have COVID-19 and can infect others',
        fill: theme.color.blue[2],
        color: theme.color.blue.text,
      },
      {
        y: cumulativeDeaths,
        label: 'Deceased',
        description: 'People who have died from COVID-19',
        fill: theme.color.red[1],
        color: theme.color.red.text,
      },
    ];

    const byLabel = config.reduce((o, {label, fill, color}) => {
      o[label.toLowerCase()] = {fill, color};
      return o;
    }, {});

    const accessors = stackAccessors(
      config.map(({y}) => y?.expected ?? (() => 0))
    );
    config.forEach((c, i) => (c.area = accessors[i]));
    // const midAccessor = accessors[2][1];

    return [config, byLabel, accessors];
  }, [
    susceptible,
    currentlyInfected,
    currentlyInfectious,
    cumulativeDeaths,
    cumulativeRecoveries,
  ]);

  const midDomain =
    currentlyInfected && currentlyInfectious && cumulativeDeaths
      ? currentlyInfected?.expected?.max +
        currentlyInfectious?.expected?.max +
        cumulativeDeaths?.expected?.max
      : 1000000;

  return (
    <div className="margin-top-5">
      <Title className="margin-bottom-3">Projections</Title>
      <Paragraph>
        Our model is based upon a standard epidemiological model called{' '}
        <strong>the SEIR model</strong>. The SEIR model is a{' '}
        <strong>compartmental model</strong>, which estimates the spread of a
        virus by dividing the population into different groups:
      </Paragraph>
      <UnorderedList className="list-style-none">
        <li>
          <InlineLabel list {...byLabel.susceptible}>
            Susceptible people
          </InlineLabel>{' '}
          are healthy and at risk for contracting COVID-19.
        </li>
        <li>
          <InlineLabel list {...byLabel.exposed}>
            Exposed people
          </InlineLabel>{' '}
          have COVID-19 and are in the incubation period; they cannot infect
          others.
        </li>
        <li>
          <InlineLabel list {...byLabel.infectious}>
            Infectious people
          </InlineLabel>{' '}
          have COVID-19 and can infect others.
        </li>
        <li>
          <InlineLabel list {...byLabel.recovered}>
            Recovered people
          </InlineLabel>{' '}
          have had COVID-19 and are immune to re-infection.
        </li>
        <li>
          <InlineLabel list {...byLabel.deceased}>
            Deceased people
          </InlineLabel>{' '}
          have passed away due to COVID-19.
        </li>
      </UnorderedList>
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
            data={indices}
            domain={population * 1.05}
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
          data={indices}
          domain={midDomain}
          initialScale="linear"
          height={height}
          width={width}
          x={x}
          xLabel="people"
          after={
            <Gutter>
              {config.map(({y, fill, label, description}, i) => (
                <DistributionLegendRow
                  key={i}
                  y={y}
                  color={fill}
                  title={label}
                  compact
                />
              ))}
            </Gutter>
          }
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
        </Graph>
        <Paragraph className="margin-top-2">
          This graph shows how COVID-19 affects the population of{' '}
          {location.name} over time. While only a small portion of the
          population actively has COVID-19 at any given time, it can quickly
          spread. The graph in the top right shows how small changes compound to
          impact the population as a whole.
        </Paragraph>
        <WithNearestData>
          {([d]) => (
            <Estimation>
              The model estimates that{' '}
              <strong>
                {susceptible?.expected &&
                  formatPercent1(
                    (population - susceptible?.expected(d)) / population
                  )}
              </strong>{' '}
              of the {location.name} population will have contracted COVID-19 by{' '}
              <span className="nowrap">{formatShortDate(x(d))}</span>.
            </Estimation>
          )}
        </WithNearestData>
      </div>
    </div>
  );
}
