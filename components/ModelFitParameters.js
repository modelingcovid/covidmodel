import * as React from 'react';
import Link from 'next/link';
import {format} from 'd3-format';
import {dayToDate, formatDate} from '../lib/date';
import {Definition, Definitions} from './Definition';

const formatR0 = format(',.2f');

export const ModelFitParameters = ({data}) => {
  return (
    <div>
      <div className="section-heading">Model-fit parameters</div>
      <p className="paragraph">
        Most parameters{' '}
        <Link href="/about">
          <a>were fit</a>
        </Link>{' '}
        on country data, but we adjust the following parameters on a per-state
        basis for a more accurate fit.
      </p>
      <Definitions>
        <Definition value={formatDate(dayToDate(data.importtime))}>
          Import date
        </Definition>
        <Definition value={formatR0(data.R0)}>
          Basic reproduction number (R0)
        </Definition>
      </Definitions>
    </div>
  );
};
