import * as React from 'react';
import Link from 'next/link';
import {dayToDate} from '../lib/date';
import {formatDate, formatNumber2} from '../lib/format';
import {Definition, Definitions} from './Definition';

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
        <Definition value={formatNumber2(data.R0)}>
          Basic reproduction number (R0)
        </Definition>
      </Definitions>
    </div>
  );
};
