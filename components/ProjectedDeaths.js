import * as React from 'react';
import {Grid} from './content';
import {Legend} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {PopulationGraph} from './configured';
import {formatDate, formatNumber, formatPercent1} from '../lib/format';
import {getLastDate} from '../lib/date';

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;

export const ProjectedDeaths = ({width, height}) => {
  const {model, stateName, summary, timeSeriesData, x} = useModelData();
  return (
    <div className="margin-top-5">
      <MethodDisclaimer />
      <div className="section-heading">
        COVID-19 will cause{' '}
        <span className="text-blue maybe-nowrap">
          {formatNumber(summary.totalProjectedDeaths)} deaths
        </span>{' '}
        in <span className="maybe-nowrap">{stateName}</span> by{' '}
        <span className="nowrap">
          {formatDate(getLastDate(timeSeriesData))}
        </span>
      </div>
      <p className="paragraph">
        We project the cumulative number of deaths on a logarithmic scale.
      </p>
      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={People}
          value={formatPercent1(
            summary.totalProjectedDeaths / model.population
          )}
          label="Fatality rate of the total population"
          method="modeled"
        />
        <MethodDefinition
          icon={HeadSideCough}
          value={formatPercent1(summary.fatalityRate)}
          label="Fatality rate of all COVID-19 cases"
          method="modeled"
        />
        <MethodDefinition
          icon={Vial}
          value={formatPercent1(summary.fatalityRatePCR)}
          label="Fatality rate of COVID-19 cases that have tested positive"
          method="modeled"
        />
      </Grid>
      <PopulationGraph
        x={x}
        xLabel="people"
        width={width}
        height={height}
        after={
          <Legend>
            <PercentileLegendRow
              title="Cumulative deaths"
              y={getCumulativeDeaths}
              color="var(--color-blue2)"
            />
          </Legend>
        }
      >
        <PercentileLine
          y={getCumulativeDeaths}
          color="var(--color-blue2)"
          gradient
        />
      </PopulationGraph>
    </div>
  );
};
