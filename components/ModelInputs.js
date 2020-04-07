import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {Grid} from './content';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {MethodDisclaimer, MethodDefinition, useModelData} from './modeling';
import {dayToDate, daysToMonths} from '../lib/date';
import {
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
  return (
    <div {...remaining}>
      <div className="section-heading">What will we do?</div>
      <p className="paragraph">
        On the left axis social distance of 100% means no contact with others,
        which yields an R₀ (basic reproduction number) for the virus of zero,
        since it cannot find new hosts. The zero-percent distance is the
        un-inhibited reproduction number which is thought to be around 3.1.
      </p>
      <p className="paragraph">
        The current distancing level is calculated based on the average of
        mobility rates for {stateName} based on the past three days of the data
        that we have. This data is usually reported with a three-day delay.
      </p>
      <MethodDisclaimer method="input" />
      <Grid className="margin-bottom-3">
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
      </Grid>
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
      </Grid>
      <DistancingGraph
        y={getDistancing}
        leftLabel="distancing"
        rightLabel="R₀"
        width={width}
        height={height}
      />
    </div>
  );
}
