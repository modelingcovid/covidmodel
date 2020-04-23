import * as React from 'react';
import {theme} from '../styles';
import {
  HospitalizationGraph,
  SEIRGraph,
  SEIRGutter,
  useSEIRConfig,
} from './configured';
import {
  Blockquote,
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
} from './content';
import {
  Area,
  DistancingGradient,
  Graph,
  Line,
  WithGraphData,
  XScaleContext,
  useCreateXScale,
  useNearestData,
} from './graph';
import {
  CurrentDate,
  CurrentScenario,
  Estimation,
  ModelStateProvider,
  useCreateModelState,
  useModelState,
  useDistancingDate,
  useLocationData,
} from './modeling';
import {useContentRect} from './util';
import {
  getDistancingDate,
  formatDistancingLevel,
  formatDistancingDuration,
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

const {useMemo, useRef} = React;

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

function XScaleDistancingPeriod({children}) {
  const distancingDate = useDistancingDate(7);
  const xScale = useCreateXScale({end: distancingDate});
  return (
    <XScaleContext.Provider value={xScale}>{children}</XScaleContext.Provider>
  );
}

function CurrentlyHospitalizedLabel() {
  return (
    <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
      current number of people who require hospitalization
    </InlineLabel>
  );
}

function HospitalCapacityLabel() {
  return (
    <InlineLabel color={theme.color.yellow.text} fill={theme.color.yellow[3]}>
      hospital capacity
    </InlineLabel>
  );
}

function TotalFatalitiesLabel() {
  return (
    <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
      total number of fatalities
    </InlineLabel>
  );
}

export function BigPicture({height, width}) {
  const sizeRef = useRef(null);
  const {width: smallWidth} = useContentRect(sizeRef, {height, width});
  const smallHeight = Math.min(256, height);

  const {location} = useModelState();
  const {population, domain} = useLocationData();
  const withDistancing = useCreateModelState({
    locationId: location.id,
    scenarioId: 'scenario2',
  });
  const withoutDistancing = useCreateModelState({
    locationId: location.id,
    scenarioId: 'scenario4',
  });

  const {label} = useSEIRConfig();

  return (
    <ModelStateProvider value={withDistancing}>
      <DistancingGradient width={width} />
      <ModelStateProvider value={withoutDistancing}>
        <DistancingGradient width={width} />
      </ModelStateProvider>
      <div className="flow-root">
        <div className="column-8" ref={sizeRef} />
        <XScaleDistancingPeriod>
          <DistancingGradient width={smallWidth} />
          <ModelStateProvider value={withoutDistancing}>
            <DistancingGradient width={smallWidth} />
          </ModelStateProvider>
          <Title>The impact of social distancing</Title>
          <Paragraph>
            To illustrate how social distancing can impact the spread of
            COVID-19, consider two example scenarios for {location.name}: one
            without social distancing, and one with significant social
            distancing.
          </Paragraph>
          <ModelStateProvider value={withoutDistancing}>
            <Paragraph className="pullquote">
              What might happen if{' '}
              <strong>{location.name} stops social distancing</strong> and
              returns to normal?
            </Paragraph>
            <Paragraph>
              The model projects that if the virus is allowed to spread
              uninhibited <strong>without social distancing measures</strong>,
              the <CurrentlyHospitalizedLabel /> will quickly exceed the
              available <HospitalCapacityLabel /> in {location.name}, which will
              increase the <TotalFatalitiesLabel />.
            </Paragraph>
            <HospitalizationGraph
              height={smallHeight}
              width={smallWidth}
              scrubber={false}
            />
          </ModelStateProvider>

          <Paragraph>
            Now consider an alternate scenario, with a social distancing period:
          </Paragraph>
          <Paragraph className="pullquote">
            What might happen if <strong>{location.name}</strong> enacts a
            policy that results in{' '}
            <strong>
              <CurrentScenario format={formatDistancingLevel} length={3} />{' '}
              social distancing levels
            </strong>
            —the same amount as{' '}
            <CurrentScenario format={formatScenarioName} length={5} />—
            <strong>
              <CurrentScenario format={formatDistancingDuration} length={7} />
            </strong>
            ?
          </Paragraph>

          <Paragraph>
            In this example, the model predicts that the{' '}
            <strong>social distancing period</strong> slows the spread of the
            virus, which allows the <CurrentlyHospitalizedLabel /> to remain
            below <HospitalCapacityLabel />, and lessen the{' '}
            <TotalFatalitiesLabel />.
          </Paragraph>

          <HospitalizationGraph
            height={smallHeight}
            width={smallWidth}
            scrubber={false}
          />
          <Paragraph>
            The contrast between the outcome of the scenario with a social
            distancing period and the scenario without distancing measures
            illustrates how social distancing “
            <strong>
              <a href="https://www.washingtonpost.com/graphics/2020/world/corona-simulator/">
                flattens the curve
              </a>
            </strong>
            .”
          </Paragraph>
          <Paragraph>
            From here, we can zoom out. How might COVID-19 affect the{' '}
            <strong>
              <Population /> people
            </strong>{' '}
            who live in {location.name}?
          </Paragraph>

          <Heading>How could distancing affect the population?</Heading>
          <Paragraph>
            Our model is based upon a standard epidemiological model called{' '}
            <strong>the SEIR model</strong>. The SEIR model is a{' '}
            <strong>compartmental model</strong>, which estimates the spread of
            a virus by dividing the population into different groups:
          </Paragraph>
          <WithCitation
            citation={
              <>
                There is much we don’t know about immunity to COVID-19. Our
                model makes a simplifying assumption that the typical immune
                response will last “
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
                have COVID-19 and are in the incubation period; they cannot
                infect others.
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
                have had COVID-19 and are{' '}
                <span className="footnote">immune</span> to re-infection.
              </ListItem>
              <ListItem>
                <InlineLabel list {...label.deceased}>
                  Deceased people
                </InlineLabel>{' '}
                have passed away due to COVID-19.
              </ListItem>
            </UnorderedList>
          </WithCitation>
          <Paragraph>
            If {location.name} returns to normal{' '}
            <strong>without any social distancing</strong>, the model projects
            that COVID-19 will quickly spread through the population:
          </Paragraph>
          <ModelStateProvider value={withoutDistancing}>
            <SEIRGraph
              domain={() => population() * 1.01}
              nice={false}
              height={smallHeight}
              width={smallWidth}
              scrubber={false}
            />
          </ModelStateProvider>
          <Paragraph>
            If {location.name} enacts a policy that resulted in{' '}
            <strong>
              <CurrentScenario format={formatDistancingLevel} length={3} />{' '}
              social distancing{' '}
              <CurrentScenario format={formatDistancingDuration} length={7} />
            </strong>
            , the model projects that COVID-19 cases would stabilize:
          </Paragraph>
          <SEIRGraph
            domain={() => population() * 1.01}
            nice={false}
            height={smallHeight}
            width={smallWidth}
            scrubber={false}
          />
          <Paragraph>
            Comparing the two examples demonstrates how social distancing plays
            a significant role in how the virus might spread. The model projects
            that scenarios with little or no social distancing result in the
            virus spreading through the population quickly, while scenarios with
            significant social distancing suppress the virus and result in fewer
            cases overall.
          </Paragraph>
          <Paragraph>
            However, we also need to consider what happens after our distancing
            period ends. What might happen if we return to normal after social
            distancing?
          </Paragraph>
        </XScaleDistancingPeriod>

        <Title className="margin-top-4">The second wave</Title>
        <Paragraph>
          Let’s look at our social distancing example on a longer timeframe. If
          we continue to model further into the future, we can project what
          might occur if we return to normal:
        </Paragraph>
        <SEIRGraph
          domain={() => population() * 1.01}
          nice={false}
          height={height}
          width={width}
          scrubber={false}
        />
        <Paragraph>
          <strong>
            By the end of the social distancing period the majority of the
            population is projected to still be susceptible to COVID-19.
          </strong>{' '}
          While the model projects that the social distancing measures drive
          cases down to nearly zero, some cases remain. If left unchecked, the
          model predicts that these cases will cause another outbreak, creating
          a <strong>second wave</strong> of infections.
        </Paragraph>

        <Paragraph>
          The second wave appears similar to the example without social
          distancing above. The model projects it will put a similar level of
          strain on {location.name}’s hospital system:
        </Paragraph>
        <HospitalizationGraph height={height} width={width} scrubber={false} />

        <Paragraph>
          <strong>Is it possible to avoid the second wave?</strong> One option
          is to continue social distancing until a <strong>vaccine</strong> is
          developed, which experts estimate will take at least a year. A vaccine
          would allow the population to develop herd immunity without requiring
          mass infections.
        </Paragraph>
        <Paragraph>
          <strong>Contact tracing</strong> is another approach that involves
          tracking the virus to identify and suppress future outbreaks{' '}
          <em>without</em> establishing herd immunity. This approach could allow
          distancing restrictions to ease, but only if certain conditions are
          met.
        </Paragraph>

        <Title className="margin-top-4">Contact tracing</Title>
        <Paragraph>
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/php/open-america/contact-tracing.html">
            Contact tracing
          </a>{' '}
          attempts to contain the virus by identifying, notifying, and testing
          people who have recently been in contact with an infected person and
          encouraging infected and at-risk people to quarantine.
        </Paragraph>
        <Paragraph>
          Data from{' '}
          <a href="https://www.medrxiv.org/content/10.1101/2020.03.19.20039347v1.full.pdf">
            South Korea
          </a>{' '}
          shows that when contact tracing is applied to a sufficient degree,
          it’s possible to ease distancing restrictions and still keep the virus
          contained for a period of time. Specifically, the data suggests that
          distancing restrictions can be reduced when the number of new
          confirmed cases per day falls below two cases per million people. To
          keep the virus contained, data suggests that for every 100 tests
          performed, only one should come back positive and 80% of positive
          tests should be able to be traced back to another known case.
        </Paragraph>
      </div>
    </ModelStateProvider>
  );
}
