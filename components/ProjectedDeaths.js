import * as React from 'react';
import {PercentileLine} from './PercentileLine';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;
const getDeathsProjected = ({cumulativeDeaths}) => cumulativeDeaths.projected;
const getDeathsLci = ({cumulativeDeaths}) => cumulativeDeaths.lci;
const getDeathsUci = ({cumulativeDeaths}) => cumulativeDeaths.uci;

export const ProjectedDeaths = ({data, scenario, state, width, height}) => (
  <div>
    <div className="section-heading">Projected deaths</div>
    <p className="paragraph">
      We project the cumulative number of deaths on a logarithmic scale. Black
      dots are confirmed counts.
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
  </div>
);
