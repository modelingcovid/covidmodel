import * as React from 'react';
import {format} from 'd3-format';
import {Definition, Definitions} from './Definition';

const wholeNumber = format(',.0f');
const percent2 = format('.2%');

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
        <Definition value={wholeNumber(data.Population)}>Population</Definition>
        <Definition value={wholeNumber(data.icuBeds)}>ICU beds</Definition>
        <Definition
          value={wholeNumber(data.staffedBeds * (1 - data.bedUtilization))}
        >
          Available hospital beds
        </Definition>
        <Definition value={percent2(data.pS)}>
          Probability of not needing hospitalization
        </Definition>
        <Definition value={percent2(data.pH)}>
          Probability of needing hospitalization without ICU care
        </Definition>
        <Definition value={percent2(data.pC)}>
          Probability of needing ICU care
        </Definition>
      </Definitions>
    </div>
  );
};
