import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {Points} from './graph';
import {Legend, LegendRow} from './Legend';
import {stateLabels} from '../lib/controls';
import {getDate} from '../lib/date';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';
import {getFirstExceedsThreshold} from '../lib/summary';

const getCurrentlyHospitalized = ({currentlyHospitalized}) =>
  currentlyHospitalized;

const getConfirmedHospitalizations = ({currentlyHospitalized}) =>
  currentlyHospitalized.confirmed;
const getProjectedCurrentlyHospitalized = ({currentlyHospitalized}) =>
  currentlyHospitalized.percentile50;
const getProjectedCurrentlyHospitalizedLCI = ({currentlyHospitalized}) =>
  currentlyHospitalized.percentile10;
const getProjectedCurrentlyHospitalizedUCI = ({currentlyHospitalized}) =>
  currentlyHospitalized.percentile90;

export const HospitalCapacity = ({data, scenario, state, width, height}) => {
  const hospitalCapacity = data.hospitalCapacity;
  const hospitalExceedsCapacity = getFirstExceedsThreshold(
    data.scenarios[scenario].timeSeriesData,
    getProjectedCurrentlyHospitalized,
    hospitalCapacity
  );
  const stateName = stateLabels[state];
  const hospitalCapacityHeading = hospitalExceedsCapacity ? (
    <>
      {stateName} will{' '}
      <span className="text-red">exceed hospital capacity</span> on{' '}
      {formatDate(getDate(hospitalExceedsCapacity))}
    </>
  ) : (
    <>
      {stateName} will stay{' '}
      <span className="text-green">below hospital capacity</span>
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
            {formatNumber(data.staffedBeds)}
          </span>
        </span>{' '}
        and discounting for that hospital system’s{' '}
        <span className="definition">
          <span className="definition-label">typical occupancy rate</span>&nbsp;
          <span className="definition-data">
            {formatPercent1(data.bedUtilization)}
          </span>
        </span>
        .
      </p>
      <OccupancyGraph
        scenario={scenario}
        data={data}
        x={getDate}
        y={getProjectedCurrentlyHospitalized}
        y0={getProjectedCurrentlyHospitalizedLCI}
        y1={getProjectedCurrentlyHospitalizedUCI}
        cutoff={hospitalCapacity}
        xLabel="people"
        cutoffLabel="Hospital capacity"
        width={width}
        height={height}
      >
        <Points y={getConfirmedHospitalizations} fill="var(--color-gray-03)" />
      </OccupancyGraph>
      <Legend>
        <LegendRow
          y={getCurrentlyHospitalized}
          format={formatNumber}
          fill="var(--color-blue-02)"
          label="Currently hospitalized"
        />
      </Legend>
    </div>
  );
};
