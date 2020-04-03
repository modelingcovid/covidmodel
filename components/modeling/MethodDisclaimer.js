import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';

import {MethodLabel} from './MethodLabel';
import {DistancingInfo} from './DistancingInfo';

const styles = css`
  .projection {
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.micro};
    font-weight: 400;
    margin-bottom: 12px;
  }
  .distancing-info {
    padding-left: 24px;
  }
`;

export const MethodDisclaimer = ({method = 'modeled'}) => {
  return (
    <div className="projection">
      <style jsx>{styles}</style>
      <MethodLabel method={method} color="yellow" />
      <span className="distancing-info text-gray-faint">
        <DistancingInfo />
      </span>
    </div>
  );
};
