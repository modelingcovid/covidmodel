import * as React from 'react';
import {theme} from '../styles';
import {OccupancyGraph} from './configured';
import {Definition, Grid} from './content';
import {Legend, Points} from './graph';
import {Bed, HospitalUser} from './icon';
import {
  PercentileLegendRow,
  ProjectionDisclaimer,
  useModelData,
} from './modeling';
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
      <div style={{display: 'flex'}}>
        <p className="paragraph" style={{flexGrow: 1}}>
          We estimate the hospital capacity for COVID-19 patients by taking the
          number of available beds and discounting for that hospital system’s
          typical occupancy rate.
        </p>
      </div>
      <Grid className="margin-bottom-1">
        <Definition
          icon={Bed}
          value={formatNumber(model.staffedBeds)}
          label="available hospital beds"
        />
        <Definition
          icon={HospitalUser}
          value={formatPercent1(model.bedUtilization)}
          label="typical occupancy rate"
        />
      </Grid>
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
