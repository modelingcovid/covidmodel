import * as React from 'react';
import {theme} from '../styles';
import {OccupancyGraph} from './configured';
import {Grid} from './content';
import {Graph, Legend, Line} from './graph';
import {Bed, HospitalUser, Poll} from './icon';
import {
  DistancingGradient,
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';

const {useMemo} = React;

const getCurrentlyHospitalized = ({currentlyHospitalized}) =>
  currentlyHospitalized;
const getCurrentlyReportedHospitalized = ({currentlyReportedHospitalized}) =>
  currentlyReportedHospitalized;
const getCumulativeHospitalized = ({cumulativeHospitalized}) =>
  cumulativeHospitalized;
const getCumulativeReportedHospitalized = ({cumulativeReportedHospitalized}) =>
  cumulativeReportedHospitalized;

export const HospitalCapacity = ({width, height}) => {
  const {
    allTimeSeriesData,
    model: {bedUtilization, hospitalCapacity, pC, pH, staffedBeds},
    stateName,
    summary,
    timeSeriesData,
    x,
  } = useModelData();
  const {dateHospitalsOverCapacity: capacityDate} = summary;

  const cumulativeDomain = useMemo(
    () =>
      Math.max(
        ...allTimeSeriesData.map(
          (d) => getCumulativeReportedHospitalized(d).expected
        )
      ),
    [allTimeSeriesData]
  );

  const hospitalCapacityHeading =
    capacityDate && capacityDate !== '-' ? (
      <>
        {stateName} will{' '}
        <span className="text-red">exceed hospital capacity</span> on{' '}
        {formatDate(new Date(capacityDate))}
      </>
    ) : (
      <>
        {stateName} will stay{' '}
        <span className="text-green">below hospital capacity</span>
      </>
    );

  return (
    <div className="margin-top-5">
      <MethodDisclaimer />
      <div className="section-heading">{hospitalCapacityHeading}</div>
      <div style={{display: 'flex'}}>
        <p className="paragraph" style={{flexGrow: 1}}>
          We estimate the hospital capacity for COVID-19 patients by taking the
          number of available beds and discounting for that hospital system’s
          typical occupancy rate.
        </p>
      </div>
      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={Bed}
          value={formatNumber(staffedBeds)}
          label="Available hospital beds"
          method="input"
        />
        <MethodDefinition
          icon={HospitalUser}
          value={formatPercent1(bedUtilization)}
          label="Typical occupancy rate"
          method="input"
        />
        <MethodDefinition
          icon={Poll}
          value={formatPercent1(pC + pH)}
          label="Probability a person with COVID-19 needs hospitalization"
          method="input"
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
              title="Currently reported hospitalized"
              y={getCurrentlyReportedHospitalized}
              color="var(--color-blue2)"
            />
            <PercentileLegendRow
              title="Currently hospitalized"
              y={getCurrentlyHospitalized}
              color="var(--color-yellow2)"
            />
          </Legend>
        }
      />
      <div className="margin-top-4">
        <Graph
          data={timeSeriesData}
          domain={cumulativeDomain}
          initialScale="linear"
          height={height}
          width={width}
          x={x}
          xLabel="people"
          after={
            <Legend>
              <PercentileLegendRow
                title="Total reported hospitalized"
                y={getCumulativeReportedHospitalized}
                color="var(--color-blue2)"
              />
              <PercentileLegendRow
                title="Total cases that require hospitalization"
                y={getCumulativeHospitalized}
                color="var(--color-yellow2)"
              />
            </Legend>
          }
        >
          <DistancingGradient />
          <PercentileLine
            y={getCumulativeReportedHospitalized}
            color="var(--color-blue2)"
          />
          <PercentileLine
            y={getCumulativeHospitalized}
            color="var(--color-yellow2)"
          />
        </Graph>
      </div>
    </div>
  );
};
