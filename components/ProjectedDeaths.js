import * as React from 'react';
import {Legend} from './graph';
import {PercentileLegendRow} from './PercentileLegendRow';
import {PercentileLine} from './PercentileLine';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';

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
