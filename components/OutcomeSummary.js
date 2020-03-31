import * as React from 'react';
import {dayToDate} from '../lib/date';
import {formatDate, formatNumber, formatPercent2} from '../lib/format';
import {Definition, Definitions} from './Definition';

export const OutcomeSummary = ({data}) => {
  return (
    <div>
      <div className="section-heading">Outcome summary</div>
      <p className="paragraph">
        Fatality rate and percent of population infected are the expected PCR
        confirmed rates with current levels of testing in the US. The infected
        percentage is expected to be a few times lower than the real rate and
        the real fatality rate a few times lower to account for unconfirmed mild
        cases.
      </p>
      <Definitions>
        <Definition value={formatNumber(data.totalProjectedDeaths)}>
          Deaths
        </Definition>
        <Definition value={formatNumber(data.totalProjectedPCRConfirmed)}>
          PCR confirmed
        </Definition>
        <Definition value={formatPercent2(data.totalProjectedInfected)}>
          Percent of population infected
        </Definition>
        <Definition value={formatPercent2(data['Fatality Rate'])}>
          Fatality rate
        </Definition>
        <Definition
          value={
            data['Date Contained'] === 'Not Contained'
              ? 'Not contained'
              : formatDate(new Date(data['Date Contained']))
          }
        >
          Date contained
        </Definition>
        <Definition
          value={
            data['Date Hospitals Over Capacity'].toLowerCase() ===
            'hospitals under capacity'
              ? 'N/A'
              : formatDate(new Date(data['Date Hospitals Over Capacity']))
          }
        >
          Date hospitals overloaded
        </Definition>
        <Definition
          value={
            data['Date ICU Over Capacity'].toLowerCase() ===
            'icu under capacity'
              ? 'N/A'
              : formatDate(new Date(data['Date ICU Over Capacity']))
          }
        >
          Date ICU overloaded
        </Definition>
      </Definitions>
    </div>
  );
};
