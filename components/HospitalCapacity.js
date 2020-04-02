import * as React from 'react';
import {OccupancyGraph} from './OccupancyGraph';
import {InlineData} from './content';
import {Legend, Points} from './graph';
import {PercentileLegendRow, ProjectionDisclaimer, useModelData} from './model';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';

const getCurrentlyReportedHospitalized = ({currentlyReportedHospitalized}) =>
  currentlyReportedHospitalized;

export const HospitalCapacity = ({width, height}) => {
  const {model, stateName, summary} = useModelData();
  const {hospitalCapacity} = model;
  const {dateHospitalsOverCapacity} = summary;

  const hospitalCapacityHeading = dateHospitalsOverCapacity ? (
    <>
      {stateName} will{' '}
      <span className="text-red">exceed hospital capacity</span> on{' '}
      {formatDate(new Date(dateHospitalsOverCapacity))}
    </>
  ) : (
    <>
      {stateName} will stay{' '}
      <span className="text-green">below hospital capacity</span>
    </>
  );

  return (
    <div className="margin-top-4">
      <ProjectionDisclaimer />
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
