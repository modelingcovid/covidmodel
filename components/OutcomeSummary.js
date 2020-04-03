import * as React from 'react';
import {dayToDate} from '../lib/date';
import {formatDate, formatNumber, formatPercent2} from '../lib/format';
import {Definition, Grid} from './content';
import {MethodDisclaimer} from './modeling';

export const OutcomeSummary = ({data}) => {
  return (
    <div className="margin-top-4">
      <MethodDisclaimer />
      <div className="section-heading">Outcome summary</div>
      <p className="paragraph">
        Fatality rate and percent of population infected are the expected PCR
        confirmed rates with current levels of testing in the US. The infected
        percentage is expected to be a few times lower than the real rate and
        the real fatality rate a few times lower to account for unconfirmed mild
        cases.
      </p>
      <Grid>
        <Definition
          value={formatNumber(data.totalProjectedDeaths)}
          label="deaths"
        />
        <Definition
          value={formatNumber(data.totalProjectedPCRConfirmed)}
          label="reported positive tests"
        />
        <Definition
          value={formatNumber(data.totalProjectedInfected)}
          label="projected infected"
        />
        <Definition
          value={formatPercent2(data.fatalityRate)}
          label="fatality rate"
        />
        <Definition
          value={
            data.dateContained
              ? formatDate(new Date(data.dateContained))
              : 'N/A'
          }
          label="containment date"
        />
        <Definition
          value={
            data.dateHospitalsOverCapacity
              ? formatDate(new Date(data.dateHospitalsOverCapacity))
              : 'N/A'
          }
          label="date hospitals overloaded"
        />
        <Definition
          value={
            data.dateICUOverCapacity
              ? formatDate(new Date(data.dateICUOverCapacity))
              : 'N/A'
          }
          label="date ICU overloaded"
        />
      </Grid>
    </div>
  );
};
