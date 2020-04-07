import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {Grid} from './content';
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
      <MethodDisclaimer />
      <div className="section-heading">Case progression curve</div>
      <p className="paragraph">
        We show the current number of infected and infectious individuals as
        well as the cumulative number of expected PCR confirmations. If less
        than 20% of the population is infected and the number of active
        infections is reduced to a small fraction of the population we consider
        the epidemic contained.
      </p>
      <Grid className="margin-bottom-3">
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
      </Grid>
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
      </PopulationGraph>
    </div>
  );
}
