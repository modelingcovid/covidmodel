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
          <Title>Flattening the curve</Title>
          <Paragraph>
            To illustrate how social distancing can impact the spread of
            COVID-19, consider two example scenarios for {location.name}:
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

          <Heading>How does distancing affect the population?</Heading>
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
                model assumes that the typical immune response will last{' '}
                <a href="https://www.nytimes.com/2020/04/13/opinion/coronavirus-immunity.html">
                  at least a year
                </a>
                .
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
            period ends. By the end of the social distancing period the majority
            of the population would still be susceptible to COVID-19. What might
            happen if we return to normal after social distancing?
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
          While the model projects that the social distancing measures drive
          cases down to nearly zero, some cases remain. If left unchecked, the
          model predicts that these cases will cause another outbreak, creating
          a <strong>second wave</strong> of infections.
        </Paragraph>

        <Paragraph>
          After distancing ends, why doesn’t the entire population become
          infected? This is due to “<strong>herd immunity</strong>.”
        </Paragraph>
        <WithCitation
          citation={
            <>
              Marc Lipsitch, “
              <a href="https://www.nytimes.com/2020/04/13/opinion/coronavirus-immunity.html">
                Who is immune to the coronavirus?
              </a>
              ”
            </>
          }
        >
          <Blockquote className="footnote">
            “As more and more people become immune to the virus, an infected
            individual has less and less chance of coming into contact with a
            person susceptible to infection. Eventually, herd immunity becomes
            pervasive enough that an infected person on average infects less
            than one other person; at that point, the number of cases starts to
            go down. If herd immunity is widespread enough, then even in the
            absence of measures designed to slow transmission, the virus will be
            contained — at least until immunity wanes or enough new people
            susceptible to infection are born.”
          </Blockquote>
        </WithCitation>
        <Paragraph>
          By the end of the year, after a lengthy period of no distancing and
          letting the virus run its course, the model predicts most people in{' '}
          {location.name} will be immune to COVID-19. However, the period of no
          distancing takes a significant toll on {location.name}’s hospital
          system.
        </Paragraph>
        <Paragraph>
          In this example, the model predicts that the{' '}
          <strong>social distancing period</strong> slows the spread of the
          virus, which allows the{' '}
          <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
            current number of people who require hospitalization
          </InlineLabel>{' '}
          to remain below{' '}
          <InlineLabel
            color={theme.color.yellow.text}
            fill={theme.color.yellow[3]}
          >
            hospital capacity
          </InlineLabel>
          , and lessen the{' '}
          <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
            total number of fatalities
          </InlineLabel>
          .
        </Paragraph>
        <HospitalizationGraph height={height} width={width} scrubber={false} />
        <Paragraph>
          However, if the virus is then allowed to spread uninhibited{' '}
          <strong>without social distancing measures</strong>, the{' '}
          <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
            current number of people who require hospitalization
          </InlineLabel>{' '}
          will quickly exceed the available{' '}
          <InlineLabel
            color={theme.color.yellow.text}
            fill={theme.color.yellow[3]}
          >
            hospital capacity
          </InlineLabel>{' '}
          in {location.name}, which will increase the{' '}
          <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
            total number of fatalities
          </InlineLabel>
          .
        </Paragraph>
        <Paragraph>
          The contrast between the outcome of the{' '}
          <strong>social distancing period</strong> and the time{' '}
          <strong>without distancing measures</strong> illustrates how social
          distancing “
          <strong>
            <a href="https://www.washingtonpost.com/graphics/2020/world/corona-simulator/">
              flattens the curve
            </a>
          </strong>
          .”
        </Paragraph>
        <Heading>Test, trace, and treat</Heading>
        <Paragraph>
          Is it possible to avoid the no-distancing peak? One option is to
          continue social distancing until a <strong>vaccine</strong> is
          developed, which experts estimate will take at least a year. A vaccine
          would allow the population to develop herd immunity without requiring
          mass infections.
        </Paragraph>
        <Paragraph>
          Another approach, called “<strong>test, trace, and treat</strong>”
          involves tracking the virus to identify and prevent future outbreaks{' '}
          <em>without</em> establishing herd immunity. This approach could allow
          distancing restrictions to ease, but only if certain conditions are
          met:
        </Paragraph>
        <UnorderedList>
          <ListItem>
            <strong>Testing rates</strong> need to be high enough to confidently
            detect all new cases of the virus.
          </ListItem>
          <ListItem>
            <strong>Trace:</strong>
          </ListItem>
          <ListItem>
            <strong>Treat:</strong>
          </ListItem>
        </UnorderedList>
      </div>
    </ModelStateProvider>
  );
}
