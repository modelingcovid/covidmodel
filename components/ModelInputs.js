import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {Grid, Section} from './content';
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

export function ModelInputs({height, width}) {
  const {
    model,
    scenarioData: {distancingDays, distancingLevel},
    stateName,
    summary,
    x,
  } = useModelData();
  return (
    <Section className="margin-top-4">
      <div className="text-jumbo margin-bottom-2">Model inputs</div>
      <div>
        <MethodDisclaimer method="input" />
        <div className="section-heading">Social distancing</div>
        <p className="paragraph">
          On the left axis social distance of 100% means no contact with others,
          which yields an R₀ (basic reproduction number) for the virus of zero,
          since it cannot find new hosts. The zero-percent distance is the
          un-inhibited reproduction number which is thought to be around 3.1.
        </p>
        <Grid className="margin-bottom-2">
          <MethodDefinition
            icon={PeopleArrows}
            value={formatPercent(1 - distancingLevel)}
            label="Social distancing level"
            method="input"
          />
          <MethodDefinition
            icon={Clock}
            value={`${formatNumber(daysToMonths(distancingDays))} months`}
            label="Social distancing period"
            method="input"
          />
        </Grid>
        <Grid className="margin-bottom-2">
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
    </Section>
  );
}
