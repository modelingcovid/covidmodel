import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';

import {Label} from '../content';
import {DistancingInfo} from './DistancingInfo';

const styles = css`
  .projection {
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.micro};
    font-weight: 400;
    margin-bottom: ${theme.spacing[1]};
  }
  .distancing-info {
    padding-left: 24px;
  }
`;

export const ProjectionDisclaimer = () => {
  return (
    <div className="projection">
      <style jsx>{styles}</style>
      <Label>Projection</Label>
      <span className="distancing-info text-gray-faint">
        <DistancingInfo />
      </span>
    </div>
  );
};
