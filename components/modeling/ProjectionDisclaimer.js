import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

import {Label} from '../content';
import {PeopleArrows} from '../icon';
import {useModelData} from './useModelData';
import {daysToMonths} from '../../lib/date';
import {formatNumber, formatPercent} from '../../lib/format';

const styles = css`
  .projection {
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.micro};
    font-weight: 400;
    margin-bottom: ${theme.spacing[1]};
  }
  .distancing-info {
    padding-left: ${theme.spacing[1]};
  }
`;

export const ProjectionDisclaimer = () => {
  const {scenarioData} = useModelData();
  const {distancingDays, distancingLevel, maintain} = scenarioData;

  let distancing = null;
  if (distancingLevel != null) {
    distancing = formatPercent(1 - distancingLevel);
  }

  return (
    <div className="projection">
      <style jsx>{styles}</style>
      <Label>Projection</Label>{' '}
      {distancing && (
        <span className="text-gray-faint distancing-info">
          <PeopleArrows
            size={18}
            style={{
              marginRight: theme.spacing[0],
              verticalAlign: 'text-bottom',
            }}
          />
          {distancing} for {formatNumber(daysToMonths(distancingDays))} months
        </span>
      )}
    </div>
  );
};
