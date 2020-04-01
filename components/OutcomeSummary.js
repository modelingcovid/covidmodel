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
        <Definition value={formatNumber(data.totalProjectedInfected)}>
          Total projected infected
        </Definition>
        <Definition value={formatPercent2(data.fatalityRate)}>
          Fatality rate
        </Definition>
        <Definition
          value={
            data.dateContained
              ? formatDate(new Date(data.dateContained))
              : 'Not contained'
          }
        >
          Date contained
        </Definition>
        <Definition
          value={
            data.dateHospitalsOverCapacity
              ? formatDate(new Date(data.dateHospitalsOverCapacity))
              : 'N/A'
          }
        >
          Date hospitals overloaded
        </Definition>
        <Definition
          value={
            data.dateICUOverCapacity
              ? formatDate(new Date(data.dateICUOverCapacity))
              : 'N/A'
          }
        >
          Date ICU overloaded
        </Definition>
      </Definitions>
    </div>
  );
};
