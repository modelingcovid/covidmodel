import * as React from 'react';
import {Grid, Gutter} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  MethodDefinition,
  MethodDisclaimer,
  PercentileLegendRow,
  PercentileLine,
  useModelData,
} from './modeling';
import {
  formatDate,
  formatNumber,
  formatPercent1,
  formatNumber2,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const getFatalitiesPerDay = ({cumulativeDeaths}, i, data) => {
  const prevCumulativeDeaths = data[i - 1]?.cumulativeDeaths || {};
  const result = {};
  for (let key of Object.keys(cumulativeDeaths)) {
    result[key] = Math.max(
      0,
      cumulativeDeaths[key] - (prevCumulativeDeaths[key] || 0)
    );
  }

  const percentiles = Object.entries(result).filter(([key]) =>
    key.startsWith('percentile')
  );
  const percentileKeys = percentiles.map(([key]) => key).sort();
  const percentileValues = percentiles
    .map(([key, value]) => value)
    .sort((a, b) => a - b);

  percentileKeys.forEach((key, i) => {
    result[key] = percentileValues[i];
  });
  return result;
};

export const ProjectedDeaths = ({width, height}) => {
  const {
    model,
    stateName,
    summary,
    timeSeriesData,
    x,
    allTimeSeriesData,
  } = useModelData();

  const {population} = model;
  const getFatalitiesPerDayPer100K = useCallback(
    (...d) => {
      const perDay = getFatalitiesPerDay(...d);
      const result = {};
      for (let key of Object.keys(perDay)) {
        result[key] = (perDay[key] * 100000) / population;
      }
      return result;
    },
    [population]
  );

  const y = getFatalitiesPerDay;

  const domain = useMemo(
    () =>
      Math.max(
        // Note: Ideally we should split allTimeSeriesData so we don't get a previous point from another dataset
        ...allTimeSeriesData.map((d, i) => y(d, i, allTimeSeriesData).expected)
      ),
    [allTimeSeriesData, y]
  );
  return (
    <div className="margin-top-5">
      <MethodDisclaimer />
      <div className="section-heading">Projected fatalities</div>
      <p className="paragraph">
        We project the cumulative number of deaths on a logarithmic scale.
      </p>
      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={People}
          value={formatPercent1(
            summary.totalProjectedDeaths / model.population
          )}
          label="Fatality rate of the total population"
          method="modeled"
        />
        <MethodDefinition
          icon={HeadSideCough}
          value={formatPercent1(summary.fatalityRate)}
          label="Fatality rate of all COVID-19 cases"
          method="modeled"
        />
        <MethodDefinition
          icon={Vial}
          value={formatPercent1(summary.fatalityRatePCR)}
          label="Fatality rate of COVID-19 cases that have tested positive"
          method="modeled"
        />
      </Grid>
      <Graph
        data={timeSeriesData}
        domain={domain}
        initialScale="linear"
        x={x}
        xLabel="people"
        controls
        width={width}
        height={height}
        after={
          <Gutter>
            <PercentileLegendRow
              title="Fatalities per day"
              y={y}
              color="var(--color-red2)"
              format={formatNumber2}
            />
          </Gutter>
        }
      >
        <PercentileLine y={y} color="var(--color-red2)" />
      </Graph>
    </div>
  );
};
