import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {
  Grid,
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Instruction,
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
  Estimation,
  ExpectedLegendEntry,
  useLocationData,
  useModelState,
} from './modeling';
import {formatNumber, formatPercent, formatPercent1} from '../lib/format';

const {useCallback, useMemo, useState} = React;

export function Fitting({height, width}) {
  const {location, x} = useModelState();

  // Can we get these from the model?
  const fatalityWeight = 3;

  const {
    cumulativeExposed,
    cumulativePcr,
    cumulativeDeaths,
    cumulativeReportedDeaths,
  } = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Title>Comparing the model with verified data</Title>
      <Paragraph>
        We use two primary data sources to calibrate the curves for each state:{' '}
        <InlineLabel
          color={theme.color.blue.text}
          fill={theme.color.blue[2]}
          glyph="stroke"
        >
          confirmed positive tests
        </InlineLabel>{' '}
        and{' '}
        <InlineLabel
          color={theme.color.red.text}
          fill={theme.color.red[1]}
          glyph="stroke"
        >
          confirmed fatalities
        </InlineLabel>
        . The model takes these data points alongside the distancing data and
        computes a set of curves that satisfy the epidemiological constraints of
        the SEIR model.
      </Paragraph>

      <WithCitation
        citation={
          <>
            To predict this number, the model combines overall estimations of{' '}
            <a href="https://www.medrxiv.org/content/10.1101/2020.03.15.20036582v2.full.pdf">
              testing capacity across the United States over time
            </a>{' '}
            and computes an adjustment for each state to fit to the available
            data.
          </>
        }
      >
        <Paragraph>
          Both datasets are imperfect. The model assumes that the number of
          reported positive tests is less than the number of cases in a region
          and predicts the{' '}
          <span className="footnote">
            <strong>fraction of cases detected by tests</strong> in{' '}
            {location.name}, accounting for how testing capacity varies over
            time.
          </span>{' '}
          While the number of fatalities can also be{' '}
          <a href="https://www.nytimes.com/2020/04/05/us/coronavirus-deaths-undercount.html">
            underreported
          </a>
          , the model doesn’t include additional adjustments beyond predicting
          the fraction of cases detected.
        </Paragraph>
      </WithCitation>

      <WithCitation
        citation={
          <>
            The total number of cases is equivalent to the number of people who
            have been in the “exposed” group.
          </>
        }
      >
        <Paragraph>
          If we look at this data on a{' '}
          <a href="https://www.nytimes.com/2020/03/20/health/coronavirus-data-logarithm-chart.html">
            logarithmic scale
          </a>
          , we can see how the actual data aligns with the model’s predictions:
          <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
            positive tests
          </InlineLabel>{' '}
          and
          <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
            reported fatalities
          </InlineLabel>
          , and how they compare to the predicted number of
          <InlineLabel
            className="footnote"
            color={theme.color.yellow.text}
            fill={theme.color.yellow[3]}
            glyph="dash"
          >
            total Covid-19 cases
          </InlineLabel>{' '}
          in {location.name} after accounting for estimated testing rates.
        </Paragraph>
        <Instruction>
          <strong>Reading the graph:</strong> Each line represents the model’s
          best estimation. The shaded area around a line indicates uncertainty:
          the darker the area, the more likely the outcome.
        </Instruction>
      </WithCitation>
      <PopulationGraph controls xLabel="people" width={width} height={height}>
        <DistributionLine
          y={cumulativeExposed}
          color={theme.color.yellow[3]}
          mode="gradient"
        />
        <DistributionLine
          y={cumulativePcr}
          color={theme.color.blue[2]}
          mode="gradient"
        />
        <DistributionLine
          y={cumulativeDeaths}
          color={theme.color.red[1]}
          strokeDasharray="6,4"
          mode="line"
          dot={false}
        />
        <DistributionLine
          y={cumulativeReportedDeaths}
          color={theme.color.red[1]}
          mode="gradient"
        />
      </PopulationGraph>
      <Grid mobile={1}>
        <DistributionLegendRow
          y={cumulativeExposed}
          color={theme.color.yellow[3]}
          title="Total Covid-19 cases"
          description="People who have been infected with Covid-19"
        />
        <DistributionLegendRow
          y={cumulativePcr}
          color={theme.color.blue[2]}
          title="Total positive tests"
          description="Total number of Covid-19 tests projected to be positive"
        />
        <DistributionLegendRow
          y={cumulativeReportedDeaths}
          color={theme.color.red[1]}
          title="Total fatalities"
          description="People who have died from Covid-19"
          formatLabel={(label) => `${label} reported fatalities`}
          before={
            <ExpectedLegendEntry
              label="Modeled total fatalities"
              color={theme.color.red[1]}
              mode="dash"
              y={cumulativeDeaths}
            />
          }
        />
      </Grid>
      <Heading className="margin-top-4">Finding the best fit</Heading>
      <Paragraph>
        To arrive at a prediction of viral spread for each state that best
        matches the available data for {location.name}, the model adjusts three
        values: the <strong>date Covid-19 arrived</strong>, the{' '}
        <strong>R₀</strong> (basic reproduction number), and{' '}
        <strong>fraction of cases being detected</strong> in {location.name}.
        Reported fatalities and confirmed positive cases are weighed at a{' '}
        {fatalityWeight}:1 ratio during the fitting process.
      </Paragraph>
    </div>
  );
}
