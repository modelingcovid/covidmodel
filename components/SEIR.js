import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {
  Grid,
  Gutter,
  InlineData,
  InlineLabel,
  Heading,
  Paragraph,
  Title,
  UnorderedList,
} from './content';
import {Area, Graph, Line, WithGraphData, useNearestData} from './graph';
import {People, SkullCrossbones, HeadSideCough} from './icon';
import {
  CurrentDate,
  DistributionLegendRow,
  DistributionSeriesFullFragment,
  Estimation,
  MethodDefinition,
  MethodDisclaimer,
  PercentileLine,
  createDistributionSeries,
  useModelState,
  usePopulation,
  useLocationData,
  useLocationQuery,
  useScenarioQuery,
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

// export const SEIRScenarioFragment = [
//   ...DistributionSeriesFullFragment,
//   `fragment SEIRScenario on Scenario {
//     cumulativeDeaths { ...DistributionSeriesFull }
//     cumulativeRecoveries { ...DistributionSeriesFull }
//     currentlyInfected { ...DistributionSeriesFull }
//     currentlyInfectious { ...DistributionSeriesFull }
//     susceptible { ...DistributionSeriesFull }
//   }`,
// ];

// const useDomain = () => {
//   const [data, error] = useLocationQuery(`{
//     domain {
//       cumulativeDeaths { expected { max } }
//       currentlyInfected { expected { max } }
//       currentlyInfectious { expected { max } }
//     }
//   }`);
//   if (!data) {
//     return [data, error];
//   }
//   const {domain} = data;
//   return [
//     domain.cumulativeDeaths.expected.max +
//       domain.currentlyInfected.expected.max +
//       domain.currentlyInfectious.expected.max,
//     error,
//   ];
// };

function PercentCases() {
  const [d] = useNearestData();
  const {population, susceptible} = useLocationData();
  return formatPercent1(
    (population() - susceptible.expected.get(d)) / population()
  );
}

export function SEIR({height, width}) {
  const {location, indices, x} = useModelState();
  const {
    population,
    seirDomain,
    susceptible,
    cumulativeRecoveries,
    currentlyInfected,
    currentlyInfectious,
    cumulativeDeaths,
  } = useLocationData();

  const [config, configValues, label] = useMemo(() => {
    const config = {
      susceptible: {
        y: susceptible,
        label: 'Susceptible',
        description: 'People who have not yet contracted COVID-19',
        fill: theme.color.magenta[1],
        color: theme.color.magenta[1],
      },
      recovered: {
        y: cumulativeRecoveries,
        label: 'Recovered',
        description: 'People who have recovered from COVID-19',
        fill: theme.color.gray[3],
        color: theme.color.gray[5],
      },
      exposed: {
        y: currentlyInfected,
        label: 'Exposed',
        description:
          'People who have been infected with COVID-19 but cannot yet infect others',
        fill: theme.color.yellow[2],
        color: theme.color.yellow.text,
      },
      infectious: {
        y: currentlyInfectious,
        label: 'Infectious',
        description: 'People who have COVID-19 and can infect others',
        fill: theme.color.blue[2],
        color: theme.color.blue.text,
      },
      deceased: {
        y: cumulativeDeaths,
        label: 'Deceased',
        description: 'People who have died from COVID-19',
        fill: theme.color.red[1],
        color: theme.color.red.text,
      },
    };

    const configValues = Object.values(config);
    const label = configValues.reduce((o, {label, fill, color}) => {
      o[label.toLowerCase()] = {fill, color};
      return o;
    }, {});

    const accessors = stackAccessors(configValues.map(({y}) => y.expected.get));
    configValues.forEach((c, i) => (c.area = accessors[i]));
    return [config, configValues, label];
  }, [
    susceptible,
    cumulativeRecoveries,
    currentlyInfected,
    currentlyInfectious,
    cumulativeDeaths,
  ]);

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
          <InlineLabel list {...label.susceptible}>
            Susceptible people
          </InlineLabel>{' '}
          are healthy and at risk for contracting COVID-19.
        </li>
        <li>
          <InlineLabel list {...label.exposed}>
            Exposed people
          </InlineLabel>{' '}
          have COVID-19 and are in the incubation period; they cannot infect
          others.
        </li>
        <li>
          <InlineLabel list {...label.infectious}>
            Infectious people
          </InlineLabel>{' '}
          have COVID-19 and can infect others.
        </li>
        <li>
          <InlineLabel list {...label.recovered}>
            Recovered people
          </InlineLabel>{' '}
          have had COVID-19 and are immune to re-infection.
        </li>
        <li>
          <InlineLabel list {...label.deceased}>
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
            domain={() => population() * 1.05}
            initialScale="linear"
            height={height / 4}
            width={width / 8}
            x={x}
            xLabel="people"
            scrubber={false}
            decoration={false}
          >
            {({xMax, yMax, yScale}) => {
              const midY = yScale(seirDomain());
              const strokeWidth = 1;
              return (
                <>
                  {configValues.map(({area: [y0, y1], fill}, i) => (
                    <Area
                      key={`area-${i}`}
                      y0={y0}
                      y1={y1}
                      fill={fill}
                      opacity="0.15"
                    />
                  ))}
                  {configValues.map(({area: [y0, y1], fill}, i) => (
                    <Line key={`line-${i}`} y={y1} stroke={fill} />
                  ))}
                  <rect
                    x="0"
                    y={midY}
                    width={xMax - strokeWidth}
                    height={yMax - midY - strokeWidth}
                    fill={theme.color.shadow[1]}
                    stroke={theme.color.gray[4]}
                    strokeWidth={strokeWidth}
                  />
                </>
              );
            }}
          </Graph>
        </div>
        <Graph
          data={indices}
          domain={seirDomain}
          initialScale="linear"
          height={height}
          width={width}
          x={x}
          xLabel="people"
        >
          {() => (
            <>
              {configValues.map(({area: [y0, y1], fill}, i) => (
                <Area
                  key={`area-${i}`}
                  y0={y0}
                  y1={y1}
                  fill={fill}
                  opacity="0.15"
                />
              ))}
              {configValues.map(({area: [y0, y1], fill}, i) => (
                <Line key={`line-${i}`} y={y1} stroke={fill} />
              ))}
            </>
          )}
        </Graph>
        {/* <Gutter>
          {configValues.map(({y, fill, label, description}, i) => (
            <DistributionLegendRow
              key={i}
              y={y}
              color={fill}
              title={label}
              compact
            />
          ))}
        </Gutter> */}
        <Paragraph className="margin-top-2">
          This graph shows how COVID-19 affects the population of{' '}
          {location.name} over time. While only a small portion of the
          population actively has COVID-19 at any given time, it can quickly
          spread. The graph in the top right shows how small changes compound to
          impact the population as a whole.
        </Paragraph>
        <Estimation>
          The model estimates that{' '}
          <strong>
            <InlineData>
              <PercentCases />
            </InlineData>
          </strong>{' '}
          of the {location.name} population will have contracted COVID-19 by{' '}
          <CurrentDate />.
        </Estimation>
      </div>
    </div>
  );
}
