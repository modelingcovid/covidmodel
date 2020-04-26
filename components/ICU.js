import * as React from 'react';
import {theme} from '../styles';
import {Gutter, InlineLabel, InlineData, Paragraph, Title} from './content';
import {Graph, Line, LegendRow} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  CapacityEstimation,
  DistributionLegendRow,
  DistributionLine,
  useLocationData,
  useModelState,
} from './modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
  formatFixedDate,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];

export const ICU = ({width, height}) => {
  const {location} = useModelState();
  const {
    currentlyCritical,
    currentlyReportedCritical,
    cumulativeCritical,
    cumulativeReportedCritical,
    dateICUOverCapacity,
    domain,
    icuBeds,
    icuCapacity,
  } = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Title>Intensive Care Unit (ICU) Admissions</Title>
      <Paragraph>
        We also model the expected number of Covid-19 cases that will require
        intensive care. Similarly to hospitalizations, we do not fit the model
        to the reported ICU admission data, but show what the model would expect
        for this location and scenario combination.
      </Paragraph>
      <Graph
        domain={domain.critical.currently}
        initialScale="log"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine y={currentlyCritical} color={blue} gradient />
            <DistributionLine y={currentlyReportedCritical} color={yellow} />
            <Line y={icuCapacity.get} stroke={red} strokeDasharray="6,3" />
          </>
        )}
      </Graph>
      <Gutter>
        <LegendRow
          label="ICU capacity"
          y={icuCapacity.get}
          color={red}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently require intensive care"
          y={currentlyCritical}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently require intensive care"
          y={currentlyReportedCritical}
          color={yellow}
          format={formatNumber}
        />
      </Gutter>
      <Paragraph>
        The graph shows projections for
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[3]}>
          patients requiring ICU admissions
        </InlineLabel>{' '}
        and the ICU capacity.
      </Paragraph>
      <CapacityEstimation subject="ICUs" date={dateICUOverCapacity} />
      <Paragraph>
        While we expect that an overshoot of ICU capacity has a dramatic effect
        of the fatality rate of Covid-19, at present we do not adjust the
        fatality rate in the model for a potential ICU overshoot.
      </Paragraph>
      <Paragraph>
        Next, we look at an analagous graph for cumulative ICU admissions, which
        is how some states report this statistic.
      </Paragraph>
      <Graph
        domain={domain.critical.cumulative}
        initialScale="log"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine y={cumulativeCritical} color={blue} gradient />
            <DistributionLine y={cumulativeReportedCritical} color={yellow} />
          </>
        )}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Total cases that require intensive care"
          y={cumulativeCritical}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Total reported hospitalized"
          y={cumulativeReportedCritical}
          color={yellow}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
