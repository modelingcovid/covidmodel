import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {InlineData} from './content';
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
        <InlineData
          label="the number of available beds"
          value={formatNumber(data.staffedBeds)}
        />{' '}
        and discounting for that hospital system’s{' '}
        <InlineData
          label="typical occupancy rate"
          value={formatPercent1(data.bedUtilization)}
        />
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
