import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {Grid, Paragraph} from './content';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  MethodDisclaimer,
  MethodDefinition,
  useFindPoint,
  useModelData,
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

const getDistancing = ({distancing}) => distancing;

export function ModelInputs({height, width, ...remaining}) {
  const {
    model,
    scenarioData: {distancingDays, distancingLevel},
    stateName,
    summary,
    x,
  } = useModelData();
  const findPoint = useFindPoint();
  const todayData = findPoint(today);
  return (
    <div {...remaining}>
      <DistancingGraph
        y={getDistancing}
        leftLabel="distancing"
        rightLabel="R₀"
        width={width}
        height={height}
      />
      {/* <Grid className="margin-top-3 margin-bottom-3">
        {distancingLevel != null && (
          <MethodDefinition
            icon={PeopleArrows}
            value={formatPercent(1 - distancingLevel)}
            label="Social distancing level"
            method="input"
          />
        )}
        <MethodDefinition
          icon={Clock}
          value={`${formatNumber(daysToMonths(distancingDays))} months`}
          label="Social distancing period"
          method="input"
        />
      </Grid> */}
      <Paragraph className="margin-top-2">
        A social distancing level of 100% means no contact with others, which
        yields an R₀ (basic reproduction number) for the virus of zero, since it
        cannot find new hosts. A social distancing level of 0% means that an
        area is operating without any social distancing measures and continuing
        life as usual.
      </Paragraph>

      <Paragraph>
        The current distancing level, {formatPercent(1 - todayData.distancing)},
        is calculated based on the average the past three days of available
        mobility data for {stateName}, which is usually reported with a
        three-day delay.
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
        We estimate that COVID-19 reached {stateName} on{' '}
        {formatDate(dayToDate(model.importtime))} has an uninhibited R₀ of{' '}
        {formatNumber2(model.r0)}.
      </Paragraph>

      {/* <MethodDisclaimer method="input" />

      <Grid className="margin-bottom-3">
        <MethodDefinition
          icon={Viruses}
          value={formatNumber2(model.r0)}
          label="Basic reproduction number (R₀)"
          method="fit"
        />
        <MethodDefinition
          icon={CalendarDay}
          value={formatShortDate(dayToDate(model.importtime))}
          label="Import date of COVID-19"
          method="fit"
        />
      </Grid> */}
    </div>
  );
}
