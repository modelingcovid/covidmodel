import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {InlineData} from './content';
import {Legend, Points} from './graph';
import {PercentileLegendRow, useModelData} from './model';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';

const getCurrentlyReportedHospitalized = ({currentlyReportedHospitalized}) =>
  currentlyReportedHospitalized;

export const HospitalCapacity = ({data, scenario, state, width, height}) => {
  const {model, stateName, summary} = useModelData();
  const {hospitalCapacity} = model;
  const {dateHospitalsOverCapacity} = summary;

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
          value={formatNumber(model.staffedBeds)}
        />{' '}
        and discounting for that hospital system’s{' '}
        <InlineData
          label="typical occupancy rate"
          value={formatPercent1(model.bedUtilization)}
        />
        .
      </p>
      <OccupancyGraph
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
