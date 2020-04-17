import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {
  Grid,
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Paragraph,
  Title,
  OrderedList,
  UnorderedList,
  WithCitation,
} from './content';
import {useNearestData} from './graph';
import {People, Vial, HeadSideCough} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  DistributionSeriesFullFragment,
  Estimation,
  MethodDefinition,
  MethodDisclaimer,
  useLocationData,
  useModelState,
} from './modeling';
import {formatNumber, formatPercent, formatPercent1} from '../lib/format';

const {useCallback, useMemo, useState} = React;

function FatalityRate({asymptomaticRate}) {
  const nearest = useNearestData();
  const {
    cumulativeExposed,
    cumulativePcr,
    cumulativeDeaths,
  } = useLocationData();

  return (
    <InlineData>
      {() =>
        formatPercent1(
          (cumulativeDeaths.expected.get(nearest()) /
            (cumulativeExposed.expected.get(nearest()) || 0.0001)) *
            (1 - asymptomaticRate)
        )
      }
    </InlineData>
  );
}

export function CaseProgressionCurve({height, width}) {
  const {location, x} = useModelState();

  const defaultAsymptomaticRate = 0.3;
  const [asymptomaticRate, setAsymptomaticRate] = useState(
    defaultAsymptomaticRate
  );
  // Can we get these from the model?
  const fatalityWeight = 3;

  const {
    cumulativeExposed,
    cumulativePcr,
    cumulativeDeaths,
  } = useLocationData();

  return (
    <div className="margin-top-5">
      <Title>Comparing the model with verified data</Title>
      <Paragraph>
        We use two primary data sources to calibrate the curves for each state:{' '}
        <InlineLabel
          color={theme.color.blue.text}
          stroke={theme.color.blue[2]}
          strokeWidth={2}
        >
          confirmed positive tests
        </InlineLabel>{' '}
        and{' '}
        <InlineLabel
          color={theme.color.red.text}
          stroke={theme.color.red[1]}
          strokeWidth={2}
        >
          confirmed fatalities
        </InlineLabel>
        . The model takes these data points alongside the distancing data and
        computes a set of curves that satisfy the epidemiological constraints of
        the SEIR model.
      </Paragraph>

      <Paragraph>
        If we look at this data on a logarithmic scale, we can see how the
        actual data aligns with the model’s predictions:
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
          positive tests
        </InlineLabel>{' '}
        and
        <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
          fatalities
        </InlineLabel>
        , and how they compare to the predicted number of
        <InlineLabel
          color={theme.color.yellow.text}
          fill={theme.color.yellow[3]}
        >
          total COVID-19 cases
        </InlineLabel>
        —the cumulative number of people who have been in the{' '}
        <strong>exposed</strong> state—in {location.name}.
      </Paragraph>
      <PopulationGraph
        controls
        x={x}
        xLabel="people"
        width={width}
        height={height}
      >
        <DistributionLine
          y={cumulativeExposed}
          color={theme.color.yellow[3]}
          gradient
        />
        <DistributionLine
          y={cumulativePcr}
          color={theme.color.blue[2]}
          gradient
        />
        <DistributionLine
          y={cumulativeDeaths}
          color={theme.color.red[1]}
          gradient
        />
      </PopulationGraph>
      <Grid mobile={1}>
        <DistributionLegendRow
          y={cumulativeExposed}
          color={theme.color.yellow[3]}
          title="Total COVID-19 cases"
          description="People who have been infected with COVID-19"
        />
        <DistributionLegendRow
          y={cumulativePcr}
          color={theme.color.blue[2]}
          title="Reported positive tests"
          description="Total number of COVID-19 tests projected to be positive"
        />
        <DistributionLegendRow
          y={cumulativeDeaths}
          color={theme.color.red[1]}
          title="Deceased"
          description="People who have died from COVID-19"
        />
      </Grid>
      <Heading className="margin-top-4">Finding the best fit</Heading>
      <Paragraph>
        The model adjusts three values to find a set of curves with the best fit
        for {location.name}: the <strong>date COVID-19 arrived</strong>, the{' '}
        <strong>R₀</strong> (basic reproduction number), and{' '}
        <strong>fraction of cases being detected</strong> in {location.name}.
        Reported fatalities and confirmed positive cases are weighed at a 3:1
        ratio during the fitting process.
      </Paragraph>
      <Heading className="margin-top-4">
        Determining symptomatic statistics
      </Heading>
      <WithCitation
        citation={
          <>
            Observed as 32% on the{' '}
            <a href="https://www.medrxiv.org/content/10.1101/2020.03.18.20038125v1.full.pdf">
              Diamond Princess
            </a>
            , 31% for{' '}
            <a href="https://www.ijidonline.com/article/S1201-9712(20)30139-9/pdf">
              Japanese citizens evacuated from Wuhan
            </a>
            , 29% in{' '}
            <a href="https://link.springer.com/content/pdf/10.1007/s11427-020-1661-4.pdf">
              China
            </a>
            , and 34% in{' '}
            <a href="https://www.medrxiv.org/content/10.1101/2020.03.26.20044446v1.full.pdf">
              Iceland
            </a>
            .
          </>
        }
      >
        <Paragraph>
          While the rate of asymptomatic cases of COVID-19 don’t influence the
          results of the COSMC model, they’re useful for generating statistics
          to compare with other models.{' '}
          <span className="footnote">
            By default, we set the <strong>asymptomatic rate</strong> to{' '}
            <strong>{formatPercent(defaultAsymptomaticRate)}</strong>.
          </span>
        </Paragraph>
        <Estimation>
          Based on an asymptomatic rate of {formatPercent(asymptomaticRate)},
          the model projects the fatality rate of symptomatic COVID-19 cases to
          be{' '}
          <strong>
            <FatalityRate asymptomaticRate={asymptomaticRate} />
          </strong>
          .
        </Estimation>
      </WithCitation>
    </div>
  );
}
