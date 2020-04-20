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
  const {r0, importtime, distancing, rt} = useLocationData();

  const formatR = useCallback((n) => formatNumber2(n * r0()), [r0]);

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
          The following graph displays
          <InlineLabel color={theme.color.blue[2]} fill={theme.color.blue.text}>
            past social distancing levels
          </InlineLabel>{' '}
          based on <span className="footnote">available mobility data</span> for{' '}
          {location.name}, and{' '}
          <InlineLabel
            color={theme.color.yellow[3]}
            fill={theme.color.yellow.text}
          >
            prospective social distancing levels
          </InlineLabel>{' '}
          based on the scenario selected above.
        </Paragraph>
        <Instruction>
          <strong>Reading the graph:</strong> The background of the graph
          corresponds to the amount of social distancing at a given time. This
          is also included on later graphs.
        </Instruction>
      </WithCitation>
      <DistancingGraph
        formatDistancing={formatDistancing}
        y={distancing}
        xLabel="distancing"
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
      </Gutter>
      <Paragraph>
        The current distancing level, <TodayDistancing />, is calculated based
        on the average the past three days of available mobility data for{' '}
        {location.name}, which is usually reported with a three-day delay.
      </Paragraph>

      <Heading className="margin-top-4">
        How does social distancing relate to how the virus spreads?
      </Heading>
      <Paragraph>
        Epidemiologists measure how quickly a disease spreads through{' '}
        <strong>R₀</strong>, its <strong>basic reproduction number</strong>,
        defined as the number of people a disease will spread to from a single
        infected person.
      </Paragraph>
      <Paragraph>
        When social distancing measures are introduced, it becomes more
        difficult for a disease to spread through a population. We represent
        this using{' '}
        <strong>
          R<sub>t</sub>
        </strong>
        , the <strong>effective reproduction number</strong>. R<sub>t</sub>{' '}
        represents how many people a single case of the disease will spread to
        at a given point in time, taking social distancing measures into
        account.
      </Paragraph>
      <Graph
        initialScale="linear"
        tickFormat={formatR}
        height={height}
        width={width}
        xLabel="R"
        nice={false}
      >
        {() => <Line y={rt} stroke={theme.color.magenta[1]} />}
      </Graph>
      <Gutter>
        <LegendRow
          label={
            <>
              R<sub>t</sub>
            </>
          }
          y={rt}
          format={formatR}
        />
      </Gutter>

      <Heading className="margin-top-5">
        How does the model differ between locations?
      </Heading>
      <Paragraph>
        We use the data available to us — reported positive tests,
        hospitalizations, and fatalities (among others) — to estimate when
        COVID-19 reached a location and how contaigious it is under those
        conditions.
      </Paragraph>
      <Estimation status={false}>
        We estimate that COVID-19 reached {location.name} on{' '}
        <InlineData width="130px">
          {() => formatDate(dayToDate(importtime()))}
        </InlineData>{' '}
        and has an R₀ of <InlineData>{() => formatNumber2(r0())}</InlineData>{' '}
        when there is no social distancing.
      </Estimation>
    </div>
  );
}
