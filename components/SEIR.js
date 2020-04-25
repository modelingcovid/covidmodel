import * as React from 'react';
import {theme} from '../styles';
import {SEIRGraph, SEIRGutter, SEIRSummary, useSEIRConfig} from './configured';
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
} from './content';
import {Area, Graph, Line, WithGraphData, useNearestData} from './graph';
import {
  CurrentDate,
  Estimation,
  useExpected,
  useModelState,
  useLocationData,
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

function PercentCases() {
  const nearest = useNearestData();
  const {population, susceptible} = useLocationData();
  const expected = useExpected();
  return (
    <InlineData>
      {() =>
        formatPercent1(
          (population() - expected(susceptible).get(nearest())) / population()
        )
      }
    </InlineData>
  );
}

export function SEIR({height, width}) {
  const {location} = useModelState();
  const {population, domain} = useLocationData();

  const {label} = useSEIRConfig();

  return (
    <div className="flow-root">
      <Heading>How could distancing affect the population?</Heading>
      <Paragraph>
        Our model is based upon a standard epidemiological model called{' '}
        <strong>the SEIR model</strong>. The SEIR model is a{' '}
        <strong>compartmental model</strong>, which estimates the spread of a
        virus by dividing the population into different groups:
      </Paragraph>
      <SEIRSummary />
      <div className="relative">
        <div
          style={{
            position: 'absolute',
            top: theme.spacing[3],
            right: theme.spacing[1],
            background: theme.color.background,
            zIndex: 2,
            boxShadow: `0 0 4px ${theme.color.shadow[1]}`,
          }}
        >
          <SEIRGraph
            domain={() => population() * 1.05}
            height={height / 4}
            width={width / 8}
            scrubber={false}
            decoration={false}
          >
            {({xMax, yMax, yScale}) => {
              const midY = yScale(domain.seir());
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
          </SEIRGraph>
        </div>
        <SEIRGraph domain={domain.seir} height={height} width={width} />
        <SEIRGutter />
        <Paragraph className="margin-top-2">
          This graph shows a detailed view of how we project that Covid-19 will
          affect the population of {location.name} over time. While only a small
          portion of the population actively has Covid-19 at any given time, it
          can quickly spread. The graph in the top right shows how small changes
          compound to impact the population as a whole.
        </Paragraph>
        <Estimation>
          The model estimates that{' '}
          <strong>
            <PercentCases />
          </strong>{' '}
          of the {location.name} population will have contracted Covid-19 by{' '}
          <CurrentDate />.
        </Estimation>
      </div>
    </div>
  );
}
