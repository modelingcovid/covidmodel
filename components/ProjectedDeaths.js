import * as React from 'react';
import {theme} from '../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
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
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const color = theme.color.red[1];
const textColor = theme.color.red.text;

export const ProjectedDeaths = ({width, height}) => {
  const {location} = useModelState();
  const {dailyDeath, domain} = useLocationData();

  // const peakWithinDistancing = useMemo(
  //   () =>
  //     distancingLevel !== 1 &&
  //     distancingIndices.reduce((prev, d) => {
  //       return prev != null &&
  //         dailyDeath.expected(prev) >= dailyDeath.expected(d)
  //         ? prev
  //         : d;
  //     }, null),
  //   [distancingLevel, distancingIndices, dailyDeath]
  // );

  return (
    <div className="margin-top-3 flow-root">
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
      {/* {peakWithinDistancing && (
        <Estimation date={false}>
          The peak number of fatalities per day before the end of the{' '}
          {formatMonths(distancingDays)}-month social distancing period in{' '}
          {location.name} is projected to occur on{' '}
          <strong className="nowrap">
            {formatShortDate(x(peakWithinDistancing))}
          </strong>
          .
        </Estimation>
      )} */}
      <Graph
        domain={domain.dailyDeath}
        initialScale="linear"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => <DistributionLine y={dailyDeath} color={color} gradient />}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Fatalities per day"
          y={dailyDeath}
          color={color}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
