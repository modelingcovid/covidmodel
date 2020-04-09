import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {
  Grid,
  Gutter,
  Heading,
  InlineLabel,
  Paragraph,
  Title,
  OrderedList,
  UnorderedList,
  WithCitation,
} from './content';
import {WithNearestData} from './graph';
import {People, Vial, HeadSideCough} from './icon';
import {
  Estimation,
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {formatNumber, formatPercent, formatPercent1} from '../lib/format';

const {useCallback, useState} = React;

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;
const getCumulativePcr = ({cumulativePcr}) => cumulativePcr;
const getCumulativeInfected = (d) => {
  const result = {};
  for (let key of Object.keys(d.currentlyInfected)) {
    result[key] =
      d.currentlyInfected[key] +
      d.currentlyInfectious[key] +
      d.cumulativeRecoveries[key] +
      d.cumulativeDeaths[key];
  }
  result.confirmed = 0;
  return result;
};

export function CaseProgressionCurve({height, width}) {
  const {model, stateName, summary, x} = useModelData();

  const defaultAsymptomaticRate = 0.3;
  const [asymptomaticRate, setAsymptomaticRate] = useState(
    defaultAsymptomaticRate
  );
  // Can we get these from the model?
  const fatalityWeight = 3;

  return (
    <div className="margin-top-5">
      <Title>Comparing the model with verified data</Title>
      <Paragraph>
        We use two primary data sources to calibrate the curves for each state:{' '}
        <InlineLabel
          color={theme.color.yellow.text}
          stroke={theme.color.yellow[3]}
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
        <InlineLabel
          color={theme.color.yellow.text}
          fill={theme.color.yellow[3]}
        >
          positive tests
        </InlineLabel>{' '}
        and
        <InlineLabel color={theme.color.red.text} fill={theme.color.red[1]}>
          fatalities
        </InlineLabel>
        , and how they compare to the predicted number of
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
          total COVID-19 cases
        </InlineLabel>{' '}
        in {stateName}.
      </Paragraph>
      {/* <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={People}
          value={formatNumber(model.population)}
          label="Total population"
          method="input"
        />
        <MethodDefinition
          icon={HeadSideCough}
          value={formatPercent1(
            summary.totalProjectedInfected / model.population
          )}
          label="Percentage of the population infected"
          method="modeled"
        />
        <MethodDefinition
          icon={Vial}
          value={formatNumber(summary.totalProjectedPCRConfirmed)}
          label="Reported positive tests"
          method="modeled"
        />
      </Grid> */}
      <PopulationGraph
        controls
        x={x}
        xLabel="people"
        width={width}
        height={height}
        after={
          <Grid mobile={1}>
            <PercentileLegendRow
              y={getCumulativeInfected}
              color={theme.color.blue[2]}
              title="Total COVID-19 cases"
              description="People who have been infected with COVID-19"
            />
            <PercentileLegendRow
              y={getCumulativePcr}
              color={theme.color.yellow[3]}
              title="Reported positive tests"
              description="Total number of COVID-19 tests projected to be positive"
            />
            <PercentileLegendRow
              y={getCumulativeDeaths}
              color={theme.color.red[1]}
              title="Deceased"
              description="People who have died from COVID-19"
            />
          </Grid>
        }
      >
        <PercentileLine
          y={getCumulativeInfected}
          color={theme.color.blue[2]}
          gradient
        />
        <PercentileLine
          y={getCumulativePcr}
          color={theme.color.yellow[3]}
          gradient
        />
        <PercentileLine
          y={getCumulativeDeaths}
          color={theme.color.red[1]}
          gradient
        />
      </PopulationGraph>
      <Heading className="margin-top-4">Finding the best fit</Heading>
      <Paragraph>
        The model adjusts three values to find a set of curves with the best fit
        for {stateName}: the <strong>date COVID-19 arrived</strong>, the{' '}
        <strong>R₀</strong> (basic reproduction number), and{' '}
        <strong>fraction of cases being detected</strong> in {stateName}.
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
        <WithNearestData>
          {(d) => (
            <Estimation>
              Based on an asymptomatic rate of{' '}
              {formatPercent(defaultAsymptomaticRate)}, the model projects the
              fatality rate of symptomatic COVID-19 cases to be{' '}
              <strong>
                {formatPercent1(
                  (getCumulativeDeaths(...d).expected /
                    getCumulativeInfected(...d).expected) *
                    (1 - asymptomaticRate)
                )}
              </strong>
              .
            </Estimation>
          )}
        </WithNearestData>
      </WithCitation>
    </div>
  );
}
