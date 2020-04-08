import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {Grid, Heading, InlineLabel, Paragraph, UnorderedList} from './content';
import {Legend} from './graph';
import {People, Vial, HeadSideCough} from './icon';
import {
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {formatNumber, formatPercent1} from '../lib/format';

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
  return (
    <div className="margin-top-5">
      {/* <MethodDisclaimer /> */}
      <Heading>How does the model compare with real data?</Heading>
      <Paragraph>
        If we look at this data on a logarithmic scale, we can see how the
        actual data aligns with the model’s predictions:
      </Paragraph>
      <UnorderedList>
        <li>
          How do the modeled number of
          <InlineLabel
            color={theme.color.yellow[3]}
            fill={theme.color.yellow[3]}
          >
            reported positive COVID-19 tests
          </InlineLabel>{' '}
          compare with the
          <InlineLabel
            color={theme.color.yellow[3]}
            stroke={theme.color.yellow[3]}
            strokeWidth={2}
          >
            confirmed testing data
          </InlineLabel>
          ?
        </li>
        <li>
          How do the modeled number of
          <InlineLabel color={theme.color.red[2]} fill={theme.color.red[2]}>
            fatalities
          </InlineLabel>{' '}
          compare with the
          <InlineLabel
            color={theme.color.red[2]}
            stroke={theme.color.red[2]}
            strokeWidth={2}
          >
            confirmed fatality data
          </InlineLabel>
          ?
        </li>
      </UnorderedList>
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
          <Legend>
            <PercentileLegendRow
              y={getCumulativeInfected}
              color="var(--color-blue2)"
              title="Total COVID-19 cases"
              description="People who have been infected with COVID-19"
            />
            <PercentileLegendRow
              y={getCumulativePcr}
              color="var(--color-yellow3)"
              title="Reported positive tests"
              description="Total number of COVID-19 tests projected to be positive"
            />
            <PercentileLegendRow
              y={getCumulativeDeaths}
              color="var(--color-red2)"
              title="Deceased"
              description="People who have died from COVID-19"
            />
          </Legend>
        }
      >
        <PercentileLine
          y={getCumulativeInfected}
          color="var(--color-blue2)"
          gradient
        />
        <PercentileLine
          y={getCumulativePcr}
          color="var(--color-yellow3)"
          gradient
        />
        <PercentileLine
          y={getCumulativeDeaths}
          color="var(--color-red2)"
          gradient
        />
      </PopulationGraph>
    </div>
  );
}
