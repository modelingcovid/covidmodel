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

export function SEIRGraph({children, ...props}) {
  const {config} = useSEIRConfig();
  return (
    <Graph {...props} initialScale="linear" xLabel="people">
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
