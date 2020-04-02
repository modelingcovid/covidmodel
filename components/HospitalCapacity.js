import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {Points} from './graph';
import {Legend} from './Legend';
import {PercentileLegendRow} from './PercentileLegendRow';
import {stateLabels} from '../lib/controls';
import {getDate} from '../lib/date';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';
import {getFirstExceedsThreshold} from '../lib/summary';

const getCurrentlyReportedHospitalized = ({currentlyReportedHospitalized}) =>
  currentlyReportedHospitalized;

export const HospitalCapacity = ({data, scenario, state, width, height}) => {
  const hospitalCapacity = data.hospitalCapacity;
  const {dateHospitalsOverCapacity} = data.scenarios[scenario].summary;
  const stateName = stateLabels[state];
  const hospitalCapacityHeading = dateHospitalsOverCapacity ? (
    <>
      {stateName} is projected to{' '}
      <span className="text-red">exceed hospital capacity</span> on{' '}
      {formatDate(new Date(dateHospitalsOverCapacity))}
    </>
  ) : (
    <>
      {stateName} is projected to stay{' '}
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
        y={getCurrentlyReportedHospitalized}
        cutoff={hospitalCapacity}
        xLabel="people"
        cutoffLabel="Hospital capacity"
        width={width}
        height={height}
        after={
          <Legend>
            <PercentileLegendRow
              title="Currently hospitalized"
              y={getCurrentlyReportedHospitalized}
              color="var(--color-blue2)"
            />
          </Legend>
        }
      />
    </div>
  );
};
