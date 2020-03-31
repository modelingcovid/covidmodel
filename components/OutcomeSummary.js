import * as React from 'react';
import {format} from 'd3-format';
import {dayToDate, formatDate} from '../lib/date';
import {Definition, Definitions} from './Definition';

const wholeNumber = format(',.0f');
const percent2 = format('.2%');

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
        <Definition value={wholeNumber(data.totalProjectedDeaths)}>
          Deaths
        </Definition>
        <Definition value={wholeNumber(data.totalProjectedPCRConfirmed)}>
          PCR confirmed
        </Definition>
        <Definition value={percent2(data.totalProjectedInfected)}>
          Percent of population infected
        </Definition>
        <Definition value={percent2(data['Fatality Rate'])}>
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
