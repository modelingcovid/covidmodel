import * as React from 'react';
import Link from 'next/link';
import {dayToDate} from '../lib/date';
import {formatDate, formatNumber2} from '../lib/format';
import {Definition, Grid} from './content';

export const ModelFitParameters = ({data}) => {
  return (
    <div>
      <div className="section-heading margin-top-4">Model-fit parameters</div>
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
          value={formatDate(dayToDate(data.importtime))}
          label="Import date"
        />
        <Definition
          value={formatNumber2(data.r0)}
          label="Basic reproduction number (R₀)"
        />
      </Grid>
    </div>
  );
};
