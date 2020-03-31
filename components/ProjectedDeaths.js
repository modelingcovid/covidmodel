import * as React from 'react';
import {Legend, LegendRow} from './Legend';
import {PercentileLine} from './PercentileLine';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';
import {formatNumber} from '../lib/format';

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;

export const ProjectedDeaths = ({data, scenario, state, width, height}) => (
  <div>
    <div className="section-heading">Projected deaths</div>
    <p className="paragraph">
      We project the cumulative number of deaths on a logarithmic scale.
    </p>
    <PopulationGraph
      scenario={scenario}
      data={data}
      x={getDate}
      xLabel="people"
      width={width}
      height={height}
    >
      <PercentileLine y={getCumulativeDeaths} color="var(--color-blue-02)" />
    </PopulationGraph>
    <Legend>
      <LegendRow
        y={getCumulativeDeaths}
        format={formatNumber}
        fill="var(--color-blue-02)"
        label="Cumulative deaths"
      />
    </Legend>
  </div>
);
