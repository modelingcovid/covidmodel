import * as React from 'react';
import {theme} from '../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  MethodDefinition,
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

const color = theme.color.red[1];
const textColor = theme.color.red.text;

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
      <Title>Finding the peak of the curve</Title>
      <Paragraph>
        Logarithmic scales and cumulative numbers can be difficult to observe by
        eye. We can get a better sense of the severity at any given point in
        time by looking at the{' '}
        <InlineLabel color={textColor} fill={color}>
          fatalities per day
        </InlineLabel>{' '}
        on a linear scale.
      </Paragraph>
      {/* <Grid className="margin-bottom-3">
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
      </Grid> */}
      <Graph
        data={timeSeriesData}
        domain={domain}
        initialScale="linear"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
        after={
          <Gutter>
            <PercentileLegendRow
              title="Fatalities per day"
              y={y}
              color={color}
              format={
                y === getFatalitiesPerDayPer100K ? formatNumber2 : formatNumber
              }
            />
          </Gutter>
        }
      >
        <PercentileLine y={y} color={color} />
      </Graph>
    </div>
  );
};
