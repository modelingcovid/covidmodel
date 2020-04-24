import * as React from 'react';
import {theme} from '../../styles';
import {
  Grid,
  Gutter,
  InlineData,
  InlineLabel,
  Heading,
  ListItem,
  Paragraph,
  Title,
  UnorderedList,
  WithCitation,
} from '../content';
import {Area, Graph, Line, WithGraphData, useNearestData} from '../graph';
import {
  DistributionLegendRow,
  Estimation,
  useModelState,
  useLocationData,
} from '../modeling';
import {stackAccessors} from '../../lib/stack';

const {useMemo} = React;

export function useSEIRConfig() {
  const {
    susceptible,
    cumulativeRecoveries,
    currentlyInfected,
    currentlyInfectious,
    cumulativeDeaths,
    currentlyHospitalizedOrICU,
  } = useLocationData();

  return useMemo(() => {
    const byId = {
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
        fill: theme.color.green[1],
        color: theme.color.green.text,
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
      hospitalized: {
        y: currentlyHospitalizedOrICU,
        label: 'Hospitalized',
        description:
          'People who are undergoing treatment for COVID-19 in the hospital or ICU',
        fill: theme.color.gray[3],
        color: theme.color.gray[5],
      },
      deceased: {
        y: cumulativeDeaths,
        label: 'Deceased',
        description: 'People who have died from COVID-19',
        fill: theme.color.red[1],
        color: theme.color.red.text,
      },
    };

    const config = Object.values(byId);
    const label = config.reduce((o, {label, fill, color}) => {
      o[label.toLowerCase()] = {fill, color};
      return o;
    }, {});

    const accessors = stackAccessors(config.map(({y}) => y.expected.get));
    config.forEach((c, i) => (c.area = accessors[i]));
    return {byId, config, label};
  }, [
    susceptible,
    cumulativeRecoveries,
    currentlyInfected,
    currentlyInfectious,
    cumulativeDeaths,
  ]);
}

export function SEIRGutter() {
  const {config} = useSEIRConfig();
  return (
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
  );
}

export function SEIRGraph({children, domain, nice = false, ...props}) {
  const {config} = useSEIRConfig();
  const {population} = useLocationData();
  const seirDomain = useMemo(() => domain || (() => population() * 1.01), [
    domain,
    population,
  ]);
  return (
    <Graph
      {...props}
      domain={seirDomain}
      initialScale="linear"
      nice={nice}
      xLabel="people"
    >
      {(context) => (
        <>
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
          {children && children(context)}
        </>
      )}
    </Graph>
  );
}

export function SEIRSummary() {
  const {label} = useSEIRConfig();
  return (
    <WithCitation
      citation={
        <>
          There is much we don’t know about immunity to COVID-19. Our model
          makes a simplifying assumption that the typical immune response will
          last “
          <a href="https://www.nytimes.com/2020/04/13/opinion/coronavirus-immunity.html">
            at least a year
          </a>
          .”
        </>
      }
    >
      <UnorderedList className="list-style-none">
        <ListItem>
          <InlineLabel list {...label.susceptible}>
            Susceptible people
          </InlineLabel>{' '}
          are healthy and at risk for contracting COVID-19.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.exposed}>
            Exposed people
          </InlineLabel>{' '}
          have COVID-19 and are in the incubation period; they cannot infect
          others.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.infectious}>
            Infectious people
          </InlineLabel>{' '}
          have COVID-19 and can infect others.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.hospitalized}>
            Hospitalized people
          </InlineLabel>{' '}
          are currently in the hospital or ICU; the model assumes they cannot
          infect others.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.recovered}>
            Recovered people
          </InlineLabel>{' '}
          have had COVID-19 and are <span className="footnote">immune</span> to
          re-infection.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.deceased}>
            Deceased people
          </InlineLabel>{' '}
          have passed away due to COVID-19.
        </ListItem>
      </UnorderedList>
    </WithCitation>
  );
}
