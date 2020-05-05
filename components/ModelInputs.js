import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph, formatDistancing} from './configured';
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

export function ModelInputs({height, width, ...remaining}) {
  const {location} = useModelState();
  const {
    r0,
    importtime,
    mostRecentDistancingDate,
    distancing,
    rt,
    domain,
  } = useLocationData();

  const formatR = useCallback((n) => formatNumber2(n), [r0]);

  return (
    <div className="flow-root" {...remaining}>
      <WithCitation
        citation={
          <>
            Past social distancing levels are calculated from Google’s{' '}
            <a href="https://www.google.com/covid19/mobility/">
              Covid-19 Community Mobility Reports
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
          The current distancing level,{' '}
          <strong>
            <TodayDistancing />
          </strong>
          , is calculated based on the average the past seven days of available
          mobility data for {location.name}, which was last updated on{' '}
          <InlineData width="130px">
            {() => (
              <strong>
                {formatDate(new Date(mostRecentDistancingDate()))}
              </strong>
            )}
          </InlineData>
          .
        </Paragraph>
      </WithCitation>
      <DistancingGraph width={width} height={height} />
      <Gutter>
        <DistributionLegendRow
          title="Social distancing level"
          y={distancing}
          format={formatDistancing}
          width="80%"
        />
      </Gutter>

      <Paragraph>
        We use the data available to us — location demographics, reported
        fatalities, and positive test cases — to estimate when Covid-19 began to
        spread in a location.
      </Paragraph>
      <Estimation status={false}>
        The model estimates that Covid-19 began to spread in {location.name} on{' '}
        <InlineData width="130px">
          {() => <strong>{formatDate(dayToDate(importtime()))}</strong>}
        </InlineData>
        .
      </Estimation>
    </div>
  );
}
