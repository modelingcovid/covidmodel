import * as React from 'react';
import {theme} from '../styles';
import {
  HospitalizationGraph,
  SEIRGraph,
  SEIRGutter,
  SEIRSummary,
  useGraphSize,
} from './configured';
import {
  Blockquote,
  Grid,
  Gutter,
  InlineData,
  InlineLabel,
  Instruction,
  Heading,
  ListItem,
  Paragraph,
  Title,
  UnorderedList,
  WithCitation,
} from './content';
import {
  Area,
  Graph,
  Line,
  WithGraphData,
  XScaleContext,
  useCreateXScale,
  useNearestData,
} from './graph';
import {
  ContainmentStrategyContext,
  CurrentDate,
  CurrentScenario,
  DateModelRun,
  Estimation,
  ModelStateProvider,
  useCreateModelState,
  useDistancingDate,
  useExpected,
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
    <InlineLabel
      color={theme.color.blue[3]}
      fill={theme.color.blue[3]}
      glyph="dash"
    >
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

export function BigPicture({location}) {
  const {ref: sizeRef, width, height} = useGraphSize();
  const partialSizeRef = useRef(null);
  const {width: smallWidth} = useContentRect(partialSizeRef, {
    height: height.regular,
    width,
  });

  const withDistancing = useCreateModelState({
    locationId: location.id,
    scenarioId: 'scenario2',
  });
  const withoutDistancing = useCreateModelState({
    locationId: location.id,
    scenarioId: 'scenario4',
  });

  return (
    <ModelStateProvider value={withDistancing}>
      <div className="flow-root">
        <div ref={sizeRef} />
        <div className="column-8" ref={partialSizeRef} />
        <Paragraph>
          The COSMC model is an epidemiological model of Covid-19, fit to actual
          social distancing, testing, and fatality data. We use this data to
          project how Covid-19 might spread through a population for different{' '}
          <strong>locations</strong> and different{' '}
          <strong>social distancing scenarios</strong>.
        </Paragraph>
        <Instruction>
          <strong>Who built this?</strong>
          <br />
          This model is developed by the Covid Open Source Modeling
          Collaboration (COSMC), a collection of researchers from{' '}
          <strong>Harvard</strong> and <strong>Stanford</strong> alongside data
          scientists and engineers at <strong>Stripe</strong> and{' '}
          <strong>GitHub</strong>.
        </Instruction>
        <WithCitation
          citation={
            <>
              We use data from the{' '}
              <a href="https://covidtracking.com/">Covid Tracking Project</a>,
              mobility data from{' '}
              <a href="https://www.google.com/covid19/mobility/">Google</a>,
              hospital capacity data from{' '}
              <a href="https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds?geometry=52.207%2C-16.820%2C-77.168%2C72.123">
                Esri
              </a>
              , and demographic data from{' '}
              <a href="https://www.wolfram.com/language/12/financial-and-socioeconomic-entities/access-detailed-us-census-data.html">
                Wolfram
              </a>
              . The model was last run on <DateModelRun />.
            </>
          }
        >
          <Paragraph>
            <strong>
              A model is only as good as{' '}
              <span className="footnote">the data it’s based on,</span>
            </strong>{' '}
            and we’re thankful for the many people and organizations who have
            worked to produce the data that powers the model. However, all data
            has its caveats and limitations: in particular, fatality counts are
            difficult to assess and{' '}
            <a href="https://www.nytimes.com/2020/04/05/us/coronavirus-deaths-undercount.html">
              often underreported
            </a>
            . We’ve tried to make the best of the available data and hope to
            continually improve the model as more data becomes available.
          </Paragraph>
        </WithCitation>
        <Blockquote>
          <em>“All models are wrong, but some are useful.”</em>
        </Blockquote>
        <XScaleDistancingPeriod>
          <Title className="margin-top-4">
            The impact of social distancing
          </Title>
          <Paragraph>
            To illustrate how social distancing can impact the spread of
            Covid-19, we’ll use an example location — {location.name} — and
            consider two scenarios: one without social distancing and one with
            significant social distancing.
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
              height={height.regular}
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
            height={height.regular}
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
            From here, we can zoom out. How might Covid-19 affect the{' '}
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
          <SEIRSummary />
          <Paragraph>
            If {location.name} returns to normal{' '}
            <strong>without any social distancing</strong>, the model projects
            that Covid-19 will quickly spread through the population:
          </Paragraph>
          <ModelStateProvider value={withoutDistancing}>
            <SEIRGraph
              height={height.regular}
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
            , the model projects that Covid-19 cases would stabilize:
          </Paragraph>
          <SEIRGraph
            height={height.regular}
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
        <SEIRGraph height={height.regular} width={width} scrubber={false} />
        <Paragraph>
          <strong>
            By the end of the social distancing period the majority of the
            population is projected to still be susceptible to Covid-19.
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
        <HospitalizationGraph
          height={height.regular}
          width={width}
          scrubber={false}
        />

        <Paragraph>
          <strong>Is it possible to avoid the second wave?</strong> One option
          is to continue social distancing until a <strong>vaccine</strong> is
          developed, which experts estimate will take at least a year. A vaccine
          would allow the population to develop herd immunity without requiring
          mass infections.
        </Paragraph>
        <Paragraph>
          <strong>“Test and trace”</strong> is another approach that involves
          tracking the virus to identify and suppress future outbreaks{' '}
          <em>without</em> establishing herd immunity. This approach could allow
          distancing restrictions to ease, but only if certain conditions are
          met.
        </Paragraph>

        <Title className="margin-top-4">Test and trace</Title>
        <Paragraph>
          A “test and trace” approach couples high testing rates with widely
          deployed contact tracing.{' '}
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/php/open-america/contact-tracing.html">
            Contact tracing
          </a>{' '}
          attempts to reduce the spread of a disease by identifying, notifying,
          and testing people who have recently been in contact with an infected
          person and encouraging infected and at-risk people to quarantine.
        </Paragraph>
        <ContainmentStrategyContext.Provider value="testTrace">
          <HospitalizationGraph
            height={height.regular}
            width={width}
            scrubber={false}
          />
        </ContainmentStrategyContext.Provider>
        {/* Citation for "new cases per day" if we use a delay in the model:
        <>
          For test and trace to be viable, testing capacity must be high
          enough to detect all new cases within a short time span. The model
          allots ten days to detect new cases: five days for symptoms to
          develop and five days until a test is reported.
        </>
        */}
        <Paragraph>
          Data from{' '}
          <a href="https://www.medrxiv.org/content/10.1101/2020.03.19.20039347v1.full.pdf">
            South Korea
          </a>{' '}
          shows that with a “test and trace” strategy it’s possible to ease
          distancing restrictions and still prevent exponential growth for a
          period of time. Specifically, the data suggests that distancing
          restrictions can be reduced when the number of new cases per day falls
          below two cases per million people. To keep the virus contained, data
          suggests that for every 100 tests performed, only one should come back
          positive and 80% of positive tests should be able to be traced back to
          another known case.
        </Paragraph>
      </div>
    </ModelStateProvider>
  );
}
