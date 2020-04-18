import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {
  FigureHeading,
  Gutter,
  InlineData,
  InlineLabel,
  Paragraph,
} from './content';
import {LegendRow} from './graph';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  createSeries,
  useDistancing,
  useFindPoint,
  useModelState,
  useLocationData,
  useLocationQuery,
  useScenarioQuery,
} from './modeling';
import {dayToDate, daysToMonths, today} from '../lib/date';
import {
  formatDate,
  formatShortDate,
  formatNumber,
  formatNumber2,
  formatPercent,
  formatPercent2,
} from '../lib/format';

const {useCallback, useMemo} = React;

function TodayDistancing() {
  const {distancing} = useLocationData();
  const findPoint = useFindPoint();
  return (
    <InlineData width="2em">
      {() => {
        const todayIndex = findPoint(today);
        const todayDistancing = distancing(todayIndex);
        return formatPercent(1 - todayDistancing);
      }}
    </InlineData>
  );
}

const formatDistancing = (n) => formatPercent(1 - n);

export function ModelInputs({height, width, ...remaining}) {
  const {location} = useModelState();
  const {r0, importtime, distancing} = useLocationData();

  const formatR0 = useCallback((n) => formatNumber2(n * r0()), [r0]);

  return (
    <div {...remaining}>
      {/* <FigureHeading>Social distancing and R₀ over time</FigureHeading> */}
      <Paragraph>
        The following graph displays
        <InlineLabel color={theme.color.blue[2]} fill={theme.color.blue.text}>
          past social distancing levels
        </InlineLabel>{' '}
        based on available mobility data for {location.name}, and{' '}
        <InlineLabel
          color={theme.color.yellow[3]}
          fill={theme.color.yellow.text}
        >
          prospective social distancing levels
        </InlineLabel>{' '}
        based on the scenario selected above.
      </Paragraph>
      <DistancingGraph
        formatDistancing={formatDistancing}
        formatR0={formatR0}
        y={distancing}
        leftLabel="distancing"
        rightLabel="R₀"
        width={width}
        height={height}
      />
      <Gutter>
        <LegendRow
          label="Social distancing level"
          y={distancing}
          format={formatDistancing}
          width="80%"
        />
        <LegendRow label="R₀" y={distancing} format={formatR0} />
      </Gutter>
      <Paragraph className="margin-top-2">
        A social distancing level of 100% means no contact with others, which
        yields an R₀ (basic reproduction number) for the virus of zero, since it
        cannot find new hosts. A social distancing level of 0% means that an
        area is operating without any social distancing measures and continuing
        life as usual.
      </Paragraph>
      <Paragraph>
        The current distancing level, <TodayDistancing />, is calculated based
        on the average the past three days of available mobility data for{' '}
        {location.name}, which is usually reported with a three-day delay.
      </Paragraph>
      <div className="section-heading margin-top-4">
        How does the model differ between locations?
      </div>
      <Paragraph>
        We use the data available to us — reported positive tests,
        hospitalizations, and fatalities (among others) — to estimate when
        COVID-19 reached a location and how contaigious it is under those
        conditions.
      </Paragraph>
      <Paragraph className="estimation">
        We estimate that COVID-19 reached {location.name} on{' '}
        <InlineData width="130px">
          {() => formatDate(dayToDate(importtime()))}
        </InlineData>{' '}
        and has an R₀ of <InlineData>{() => formatNumber2(r0())}</InlineData>{' '}
        when there is no social distancing.
      </Paragraph>
    </div>
  );
}
