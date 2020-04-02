import * as React from 'react';
import {Legend} from './graph';
import {
  PercentileLegendRow,
  PercentileLine,
  ProjectionDisclaimer,
  useModelData,
} from './model';
import {PopulationGraph} from './PopulationGraph';
import {formatDate, formatNumber} from '../lib/format';
import {getLastDate} from '../lib/date';

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;

export const ProjectedDeaths = ({width, height}) => {
  const {
    model,
    scenario,
    stateName,
    summary: {totalProjectedDeaths},
    timeSeriesData,
    x,
  } = useModelData();

  return (
    <div className="margin-top-4">
      <ProjectionDisclaimer />
      <div className="section-heading">
        COVID-19 will cause{' '}
        <span className="text-blue maybe-nowrap">
          {formatNumber(totalProjectedDeaths)} deaths
        </span>{' '}
        in <span className="maybe-nowrap">{stateName}</span> by{' '}
        <span className="nowrap">
          {formatDate(getLastDate(timeSeriesData))}
        </span>
      </div>
      <p className="paragraph">
        We project the cumulative number of deaths on a logarithmic scale.
      </p>
      <PopulationGraph
        scenario={scenario}
        data={model}
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
