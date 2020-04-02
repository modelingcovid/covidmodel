import * as React from 'react';
import {theme} from '../styles';
import {PopulationGraph} from './configured';
import {Definition, Grid} from './content';
import {Legend} from './graph';
// import {Bed, HospitalUser} from './icon';
import {
  PercentileLegendRow,
  PercentileLine,
  ProjectionDisclaimer,
  useModelData,
} from './modeling';

const getCumulativePcr = ({cumulativePcr}) => cumulativePcr;
const getCurrentlyInfected = ({currentlyInfected}) => currentlyInfected;
const getCurrentlyInfectious = ({currentlyInfectious}) => currentlyInfectious;

export function CaseProgressionCurve({height, width}) {
  const {stateName, summary, x} = useModelData();
  return (
    <div className="margin-top-4">
      <ProjectionDisclaimer />
      <div className="section-heading">Case progression curve</div>
      <p className="paragraph">
        We show the current number of infected and infectious individuals as
        well as the cumulative number of expected PCR confirmations. If less
        than 20% of the population is infected and the number of active
        infections is reduced to a small fraction of the population we consider
        the epidemic contained.
      </p>
      <PopulationGraph
        x={x}
        xLabel="people"
        width={width}
        height={height}
        after={
          <Legend>
            <PercentileLegendRow
              y={getCurrentlyInfected}
              color="var(--color-blue2)"
              title="Currently exposed"
              description="People who have been exposed to COVID-19 and are in the incubation period, but are not yet infectious."
            />
            <PercentileLegendRow
              y={getCurrentlyInfectious}
              color="var(--color-magenta1)"
              title="Currently infectious"
              description="People who have COVID-19 and can infect others."
            />
            <PercentileLegendRow
              y={getCumulativePcr}
              color="var(--color-yellow2)"
              title="Cumulative reported positive tests"
              description="Total number of COVID-19 that are projected to be positive."
            />
          </Legend>
        }
      >
        <PercentileLine y={getCurrentlyInfected} color="var(--color-blue2)" />
        <PercentileLine
          y={getCurrentlyInfectious}
          color="var(--color-magenta1)"
        />
        <PercentileLine y={getCumulativePcr} color="var(--color-yellow2)" />
      </PopulationGraph>
    </div>
  );
}
