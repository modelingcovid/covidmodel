import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {Definition, Grid, Section} from './content';
import {useModelData} from './modeling';
import {dayToDate} from '../lib/date';
import {
  formatDate,
  formatNumber,
  formatNumber2,
  formatPercent2,
} from '../lib/format';

const getDistancing = ({distancing}) => distancing;

export function ModelInputs({height, width}) {
  const {model, stateName, summary, x} = useModelData();
  return (
    <Section className="margin-top-4">
      <div className="text-jumbo margin-bottom-1">Model inputs</div>
      <div>
        <div className="section-heading">Social distancing</div>
        <p className="paragraph">
          On the left axis social distance of 100% means no contact with others,
          which yields an R₀ (basic reproduction number) for the virus of zero,
          since it cannot find new hosts. The zero-percent distance is the
          un-inhibited reproduction number which is thought to be around 3.1.
        </p>
        <DistancingGraph
          y={getDistancing}
          leftLabel="distancing"
          rightLabel="R₀"
          width={width}
          height={height}
        />
      </div>
      <div className="margin-top-4">
        <div className="section-heading">Demographic parameters</div>
        <p className="paragraph">
          Demographic parameters are calculated based on publicly available data
          on age distributions and hospital capacity. The hospitalization
          probabilities are computed based on assumed age-based need and state
          age distributions.
        </p>
        <Grid>
          <Definition
            value={formatNumber(model.population)}
            label="total population"
          />
          <Definition
            value={formatNumber(model.icuBeds)}
            label="available ICU beds"
          />
          <Definition
            value={formatPercent2(model.pS)}
            label="probability of not needing hospitalization"
          />
          <Definition
            value={formatPercent2(model.pH)}
            label="probability of needing hospitalization without ICU care"
          />
          <Definition
            value={formatPercent2(model.pC)}
            label="probability of needing ICU care"
          />
        </Grid>
      </div>
      <div className="margin-top-4">
        <div className="section-heading">Model-fit parameters</div>
        <p className="paragraph">
          Most parameters{' '}
          <Link href="/about">
            <a>were fit</a>
          </Link>{' '}
          on country data, but we adjust the following parameters on a per-state
          basis for a more accurate fit.
        </p>
        <Grid>
          <Definition
            value={formatDate(dayToDate(model.importtime))}
            label="Import date"
          />
          <Definition
            value={formatNumber2(model.r0)}
            label="Basic reproduction number (R₀)"
          />
        </Grid>
      </div>
    </Section>
  );
}
