import {Area, Line, Points} from './graph';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';

const getDeathsConfirmed = ({cumulativeDeaths}) => cumulativeDeaths.confirmed;
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
      <Area y0={getDeathsLci} y1={getDeathsUci} fill="#0670de" opacity="0.2" />
      <Line y={getDeathsProjected} stroke="#0670de" />
      <Points y={getDeathsConfirmed} fill="var(--color-gray-03)" />
    </PopulationGraph>
  </div>
);
