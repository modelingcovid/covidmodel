import * as React from 'react';
import {Definition, Definitions} from './Definition';
import {formatNumber, formatPercent2} from '../lib/format';

export const DemographicParameters = ({data}) => {
  return (
    <div>
      <div className="section-heading">Demographic parameters</div>
      <p className="paragraph">
        Demographic parameters are calculated based on publicly available data
        on age distributions and hospital capacity. The hospitalization
        probabilities are computed based on assumed age-based need and state age
        distributions.
      </p>
      <Definitions>
        <Definition value={formatNumber(data.population)}>
          Population
        </Definition>
        <Definition value={formatNumber(data.icuBeds)}>ICU beds</Definition>
        <Definition
          value={formatNumber(data.staffedBeds * (1 - data.bedUtilization))}
        >
          Available hospital beds
        </Definition>
        <Definition value={formatPercent2(data.pS)}>
          Probability of not needing hospitalization
        </Definition>
        <Definition value={formatPercent2(data.pH)}>
          Probability of needing hospitalization without ICU care
        </Definition>
        <Definition value={formatPercent2(data.pC)}>
          Probability of needing ICU care
        </Definition>
      </Definitions>
    </div>
  );
};
