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
          <Paragraph className="pullquote">
            What would happen if <strong>{location.name}</strong> enacted a
            policy that set social distancing levels to{' '}
            <strong>
              <CurrentScenario format={formatDistancingLevel} length={3} />
            </strong>{' '}
            (the same levels used in{' '}
            <CurrentScenario format={formatScenarioName} length={5} />){' '}
            <CurrentScenario format={formatDistancingDuration} length={7} />?
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
          <ModelStateProvider value={withoutDistancing}>
            <Paragraph>
              Now consider an alternate scenario, without a social distancing
              period:
            </Paragraph>
            <Paragraph className="pullquote">
              What would happen if <strong>{location.name}</strong> stopped
              social distancing and returned to normal?
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

          <Title>------</Title>
          <Paragraph>
            Our model is based upon a standard epidemiological model called{' '}
            <strong>the SEIR model</strong>. The SEIR model is a{' '}
            <strong>compartmental model</strong>, which estimates the spread of
            a virus by dividing the population into different groups:
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
            live in {location.name}. During the distancing period, infections
            taper off to nearly nothing. After the distancing period ends, the
            infections return—first slowly, then rapidly and then taper off
            without infecting the entire population.
          </Paragraph>
        </XScaleDistancingPeriod>
        <Heading>The second wave</Heading>
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
