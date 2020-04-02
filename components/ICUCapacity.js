import * as React from 'react';
import {theme} from '../styles';
import {OccupancyGraph} from './configured';
import {Definition, Grid} from './content';
import {Legend, Points} from './graph';
import {Bed, Lungs, Poll} from './icon';
import {
  PercentileLegendRow,
  ProjectionDisclaimer,
  useModelData,
} from './modeling';
import {formatDate, formatPercent1, formatNumber} from '../lib/format';

const getCurrentlyCritical = ({currentlyCritical}) => currentlyCritical;

export const ICUCapacity = ({width, height}) => {
  const {
    model: {icuBeds, ventilators, pC},
    stateName,
    summary,
  } = useModelData();
  const {dateICUOverCapacity: capacityDate} = summary;

  const heading = capacityDate ? (
    <>
      {stateName} will <span className="text-red">exceed ICU capacity</span> on{' '}
      {formatDate(new Date(capacityDate))}
    </>
  ) : (
    <>
      {stateName} will stay{' '}
      <span className="text-green">below ICU capacity</span>
    </>
  );

  return (
    <div className="margin-top-4">
      <ProjectionDisclaimer />
      <div className="section-heading">{heading}</div>
      <div style={{display: 'flex'}}>
        <p className="paragraph" style={{flexGrow: 1}}>
          We assign a higher probability of fatality in the case the ICU
          capacity is over-shot. This can be seen in countries like Italy where
          the fatality rate is substantially higher even controlling for the age
          distribution.
        </p>
      </div>
      <Grid className="margin-bottom-1">
        <Definition
          icon={Bed}
          value={formatNumber(icuBeds)}
          label="available ICU beds"
        />
        <Definition
          icon={Lungs}
          value={formatNumber(ventilators)}
          label="ventilators"
        />
        <Definition
          icon={Poll}
          value={formatPercent1(pC)}
          label="probability a person with COVID-19 needs ICU care"
        />
      </Grid>
      <OccupancyGraph
        y={getCurrentlyCritical}
        cutoff={icuBeds}
        xLabel="people"
        cutoffLabel="ICU capacity"
        width={width}
        height={height}
        after={
          <Legend>
            <PercentileLegendRow
              title="Currently hospitalized"
              y={getCurrentlyCritical}
              color="var(--color-blue2)"
            />
          </Legend>
        }
      />
    </div>
  );
};
