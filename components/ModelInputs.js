import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Instruction,
  Paragraph,
  WithCitation,
} from './content';
import {Graph, LegendRow, Line} from './graph';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  Estimation,
  DistributionLegendRow,
  DistributionLine,
  useFindPoint,
  useModelState,
  useLocationData,
  useTodayDistancing,
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
  const todayDistancing = useTodayDistancing();
  return (
    <InlineData width="2em">
      {() => formatPercent(1 - todayDistancing())}
    </InlineData>
  );
}

const formatDistancing = (n) => formatPercent(1 - n);

export function ModelInputs({height, width, ...remaining}) {
  const {location} = useModelState();
  const {r0, importtime, distancing, rt, domain} = useLocationData();

  const formatR = useCallback((n) => formatNumber2(n), [r0]);

  return (
    <div className="flow-root" {...remaining}>
      <WithCitation
        citation={
          <>
            Past social distancing levels are calculated from Google’s{' '}
            <a href="https://www.google.com/covid19/mobility/">
              COVID-19 Community Mobility Reports
            </a>
            , which track movement trends over time by geographic area and
            location category (e.g., retail, transit, workplace) relative to a
            baseline. For more information, see{' '}
            <a href="https://www.google.com/covid19/mobility/data_documentation.html">
              the documentation
            </a>
            .
          </>
        }
      >
        <Paragraph>
          The following graph displays social distancing levels relative to
          regular social activity.
          <InlineLabel color={theme.color.blue[2]} fill={theme.color.blue.text}>
            Past social distancing levels
          </InlineLabel>{' '}
          are based on <span className="footnote">available mobility data</span>{' '}
          for {location.name}, and{' '}
          <InlineLabel
            color={theme.color.yellow[3]}
            fill={theme.color.yellow.text}
          >
            prospective social distancing levels
          </InlineLabel>{' '}
          are based on the scenario selected above.
        </Paragraph>
        <Paragraph>
          The current distancing level, <TodayDistancing />, is calculated based
          on the average the past three days of available mobility data for{' '}
          {location.name}, which is usually reported with a three-day delay.
        </Paragraph>
      </WithCitation>
      <DistancingGraph
        formatDistancing={formatDistancing}
        y={distancing}
        xLabel="distancing"
        width={width}
        height={height}
      />
      <Gutter>
        <DistributionLegendRow
          label="Social distancing level"
          y={distancing}
          format={formatDistancing}
          width="80%"
        />
      </Gutter>
      <Instruction>
        <strong>Reading the graph:</strong> The background of the graph
        corresponds to the amount of social distancing at a given time. This is
        also included on later graphs.
      </Instruction>

      <Paragraph>
        We use the data available to us — location demographics, reported
        fatalities, and positive test cases — to estimate when COVID-19 reached
        a location.
      </Paragraph>
      <Estimation status={false}>
        We estimate that COVID-19 reached {location.name} on{' '}
        <InlineData width="130px">
          {() => <strong>{formatDate(dayToDate(importtime()))}</strong>}
        </InlineData>
        .
      </Estimation>
    </div>
  );
}
