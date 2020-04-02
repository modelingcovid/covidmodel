import * as React from 'react';
import {Definition, Grid} from './content';
import {formatNumber, formatPercent2} from '../lib/format';

export const DemographicParameters = ({data}) => {
  return (
    <div>
      <div className="section-heading margin-top-4">Demographic parameters</div>
      <p className="paragraph">
        Demographic parameters are calculated based on publicly available data
        on age distributions and hospital capacity. The hospitalization
        probabilities are computed based on assumed age-based need and state age
        distributions.
      </p>
      <Grid>
        <Definition
          value={formatNumber(data.population)}
          label="total population"
        />
        <Definition
          value={formatNumber(data.icuBeds)}
          label="available ICU beds"
        />
        <Definition
          value={formatPercent2(data.pS)}
          label="probability of not needing hospitalization"
        />
        <Definition
          value={formatPercent2(data.pH)}
          label="probability of needing hospitalization without ICU care"
        />
        <Definition
          value={formatPercent2(data.pC)}
          label="probability of needing ICU care"
        />
      </Grid>
    </div>
  );
};
