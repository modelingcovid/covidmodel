import * as React from 'react';
import {format as formatNumber} from 'd3-format';
import {OccupancyGraph} from './OccupancyGraph';
import {Points} from './Points';
import {stateLabels} from '../lib/controls';
import {getDate, formatDate} from '../lib/date';
import {getFirstExceedsThreshold} from '../lib/summary';

const getConfirmedHospitalizations = ({confirmedHospitalizations}) =>
  confirmedHospitalizations;
const getProjectedCurrentlyHospitalized = ({projectedCurrentlyHospitalized}) =>
  projectedCurrentlyHospitalized;

const formatComma = formatNumber(',');
const formatPercent = formatNumber('.1%');

export const HospitalCapacity = ({data, scenario, state, width, height}) => {
  const hospitalCapacity = (1 - data.bedUtilization) * data.staffedBeds;
  const hospitalExceedsCapacity = getFirstExceedsThreshold(
    data[scenario].timeSeriesData,
    getProjectedCurrentlyHospitalized,
    hospitalCapacity
  );
  const stateName = stateLabels[state];
  const hospitalCapacityHeading = hospitalExceedsCapacity ? (
    <>
      {stateName} hospitals will{' '}
      <span className="text-red">exceed capacity</span> on{' '}
      {formatDate(getDate(hospitalExceedsCapacity))}
    </>
  ) : (
    <>
      {stateName} hospitals will stay{' '}
      <span className="text-green">below capacity</span>
    </>
  );
  return (
    <div>
      <div className="section-heading">{hospitalCapacityHeading}</div>
      <p className="paragraph">
        We estimate the hospital capacity for COVID-19 patients by taking{' '}
        <span className="definition">
          <span className="definition-label">the number of available beds</span>
          &nbsp;
          <span className="definition-data">
            {formatComma(data.staffedBeds)}
          </span>
        </span>{' '}
        and discounting for that hospital system’s{' '}
        <span className="definition">
          <span className="definition-label">typical occupancy rate</span>&nbsp;
          <span className="definition-data">
            {formatPercent(data.bedUtilization)}
          </span>
        </span>
        .
      </p>
      <OccupancyGraph
        scenario={scenario}
        data={data}
        x={getDate}
        y={getProjectedCurrentlyHospitalized}
        cutoff={hospitalCapacity}
        xLabel="Hospital occupancy"
        cutoffLabel="Hospital capacity"
        width={width}
        height={height}
      >
        <Points y={getConfirmedHospitalizations} fill="var(--color-gray-03)" />
      </OccupancyGraph>
    </div>
  );
};
