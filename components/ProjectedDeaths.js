import {Line, Points} from './graph';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';

const getConfirmedDeaths = ({cumulativeDeaths}) => cumulativeDeaths.confirmed;
const getProjectedDeaths = ({cumulativeDeaths}) => cumulativeDeaths.projected;

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
      <Line y={getProjectedDeaths} stroke="#0670de" />
      <Points y={getConfirmedDeaths} fill="var(--color-gray-03)" />
    </PopulationGraph>
  </div>
);
