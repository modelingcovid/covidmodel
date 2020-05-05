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
  useExpected,
  useModelState,
  useLocationData,
} from '../modeling';
import {stackAccessors} from '../../lib/stack';

const {useMemo} = React;

export function useSEIRConfig() {
  const expected = useExpected();
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
        description: 'People who have not yet contracted Covid-19',
        fill: theme.color.magenta[1],
        color: theme.color.magenta[1],
      },
      recovered: {
        y: cumulativeRecoveries,
        label: 'Recovered',
        description: 'People who have recovered from Covid-19',
        fill: theme.color.green[1],
        color: theme.color.green.text,
      },
      exposed: {
        y: currentlyInfected,
        label: 'Exposed',
        description:
          'People who have been infected with Covid-19 but cannot yet infect others',
        fill: theme.color.yellow[2],
        color: theme.color.yellow.text,
      },
      infectious: {
        y: currentlyInfectious,
        label: 'Infectious',
        description: 'People who have Covid-19 and can infect others',
        fill: theme.color.blue[2],
        color: theme.color.blue.text,
      },
      hospitalized: {
        y: currentlyHospitalizedOrICU,
        label: 'Hospitalized',
        description:
          'People who are undergoing treatment for Covid-19 in the hospital or ICU',
        fill: theme.color.gray[3],
        color: theme.color.gray[5],
      },
      deceased: {
        y: cumulativeDeaths,
        label: 'Deceased',
        description: 'People who have died from Covid-19',
        fill: theme.color.red[1],
        color: theme.color.red.text,
      },
    };

    const config = Object.values(byId);
    const label = config.reduce((o, {label, fill, color}) => {
      o[label.toLowerCase()] = {fill, color};
      return o;
    }, {});

    const accessors = stackAccessors(config.map(({y}) => expected(y).get));
    config.forEach((c, i) => (c.area = accessors[i]));
    return {byId, config, label};
  }, [
    expected,
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
          In practice, while up to 10% of reported cases in both{' '}
          <a href="https://www.who.int/docs/default-source/coronaviruse/who-china-joint-mission-on-covid-19-final-report.pdf">
            China
          </a>{' '}
          and{' '}
          <a href="https://www.epicentro.iss.it/coronavirus/bollettino/Infografica_7aprile%20ITA.pdf">
            Italy
          </a>{' '}
          were among healthcare workers, the WHO found that in a limited set of
          infected healthcare workers outside of{' '}
          <a href="https://www.who.int/docs/default-source/coronaviruse/who-china-joint-mission-on-covid-19-final-report.pdf">
            Hubei
          </a>
          , “the exposure for most was reported to have been traced back to a
          confirmed case in a household.”
        </>
      }
    >
      <UnorderedList className="list-style-none">
        <ListItem>
          <InlineLabel list {...label.susceptible}>
            Susceptible people
          </InlineLabel>{' '}
          are healthy and at risk for contracting Covid-19.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.exposed}>
            Exposed people
          </InlineLabel>{' '}
          have Covid-19 and are in the incubation period; the model assumes most
          exposed people cannot infect others.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.infectious}>
            Infectious people
          </InlineLabel>{' '}
          have Covid-19 and can infect others.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.hospitalized}>
            Hospitalized people
          </InlineLabel>{' '}
          are currently in the hospital or ICU. As a simplifying assumption, we
          do not model susceptible healthcare workers. As a result,{' '}
          <span className="footnote">
            the model assumes hospitalized people cannot infect others.
          </span>
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.recovered}>
            Recovered people
          </InlineLabel>{' '}
          have had Covid-19 and are considered immune to re-infection. Our model
          assumes that the typical immune response will last “
          <a href="https://www.nytimes.com/2020/04/13/opinion/coronavirus-immunity.html">
            at least a year
          </a>
          .”
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.deceased}>
            Deceased people
          </InlineLabel>{' '}
          have passed away due to Covid-19.
        </ListItem>
      </UnorderedList>
    </WithCitation>
  );
}
