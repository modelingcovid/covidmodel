import * as React from 'react';
import {theme} from '../styles';
import {SEIRGraph, SEIRGutter, useSEIRConfig} from './configured';
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
  CurrentScenario,
  Estimation,
  useModelState,
  useLocationData,
} from './modeling';
import {
  formatDistancingLevel,
  formatDistancingDurationTerse,
  formatScenarioName,
} from '../lib/controls';
import {getLastDate} from '../lib/date';
import {
  formatShortDate,
  formatNumber,
  formatLargeNumberVerbose,
  formatPercent,
  formatPercent1,
} from '../lib/format';
import {stackAccessors} from '../lib/stack';

const {useMemo} = React;

function PercentCases() {
  const nearest = useNearestData();
  const {population, susceptible} = useLocationData();
  return (
    <InlineData>
      {() =>
        formatPercent1(
          (population() - susceptible.expected.get(nearest())) / population()
        )
      }
    </InlineData>
  );
}

function Population() {
  const {population} = useLocationData();
  return (
    <InlineData length={12}>
      {() => formatLargeNumberVerbose(population())}
    </InlineData>
  );
}

export function BigPicture({height, width}) {
  const {location, scenarioData} = useModelState();
  const {population, domain} = useLocationData();

  const {label} = useSEIRConfig();

  return (
    <div className="margin-top-3 flow-root">
      <Title className="margin-bottom-3">The big picture</Title>
      <Paragraph>
        To illustrate how social distancing can impact the spread of COVID-19,
        let’s consider an example:
      </Paragraph>
      <Paragraph className="pullquote">
        What would happen if <strong>{location.name}</strong> enacted a policy
        that set social distancing levels to{' '}
        <strong>
          <CurrentScenario format={formatDistancingLevel} length={3} />{' '}
        </strong>
        (the same levels used in{' '}
        <CurrentScenario format={formatScenarioName} length={5} />) and then
        completely lifted distancing restrictions after{' '}
        <CurrentScenario format={formatDistancingDurationTerse} length={7} />?
      </Paragraph>
      <Paragraph>
        Our model is based upon a standard epidemiological model called{' '}
        <strong>the SEIR model</strong>. The SEIR model is a{' '}
        <strong>compartmental model</strong>, which estimates the spread of a
        virus by dividing the population into different groups:
      </Paragraph>
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
          <InlineLabel list {...label.recovered}>
            Recovered people
          </InlineLabel>{' '}
          have had COVID-19 and are immune to re-infection.
        </ListItem>
        <ListItem>
          <InlineLabel list {...label.deceased}>
            Deceased people
          </InlineLabel>{' '}
          have passed away due to COVID-19.
        </ListItem>
      </UnorderedList>
      <SEIRGraph
        domain={population}
        height={height}
        width={width}
        scrubber={false}
      />
      <Paragraph>
        <strong>
          <Population /> people
        </strong>{' '}
        live in {location.name}. During the distancing period, infections taper
        off to nearly nothing. After the distancing period ends, the infections
        return—first slowly, then rapidly and then taper off without infecting
        the entire population.
      </Paragraph>
      <Paragraph>
        After distancing ends, why doesn’t the entire population become
        infected? This is called “herd immunity.”
      </Paragraph>
    </div>
  );
}
