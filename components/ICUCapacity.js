import * as React from 'react';
import {theme} from '../styles';
import {OccupancyGraph} from './configured';
import {Grid} from './content';
import {Legend, Points} from './graph';
import {Bed, Lungs, Poll} from './icon';
import {
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
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

  const heading =
    capacityDate && capacityDate !== '-' ? (
      <>
        {stateName} will <span className="text-red">exceed ICU capacity</span>{' '}
        on {formatDate(new Date(capacityDate))}
      </>
    ) : (
      <>
        {stateName} will stay{' '}
        <span className="text-green">below ICU capacity</span>
      </>
    );

  return (
    <div className="margin-top-4">
      <MethodDisclaimer />
      <div className="section-heading">{heading}</div>
      <p className="paragraph">
        We assign a higher probability of fatality in the case the ICU capacity
        is over-shot. This can be seen in countries like Italy where the
        fatality rate is substantially higher even controlling for the age
        distribution.
      </p>
      <Grid className="margin-bottom-2">
        <MethodDefinition
          icon={Bed}
          value={formatNumber(icuBeds)}
          label="Available ICU beds"
          method="input"
        />
        <MethodDefinition
          icon={Lungs}
          value={formatNumber(ventilators)}
          label="Ventilators"
          method="input"
        />
        <MethodDefinition
          icon={Poll}
          value={formatPercent1(pC)}
          label="Probability a person with COVID-19 needs ICU care"
          method="input"
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
              title="Currently require intensive care"
              y={getCurrentlyCritical}
              color="var(--color-blue2)"
            />
          </Legend>
        }
      />
    </div>
  );
};
