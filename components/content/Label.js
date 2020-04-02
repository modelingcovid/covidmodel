import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

const styles = css`
  span {
    font-weight: 500;
    font-family: ${theme.font.family.mono};
    text-transform: uppercase;
  }
`;

export const Label = ({children, ...remaining}) => (
  <span className="highlight" {...remaining}>
    <style jsx>{styles}</style>
    {children}
  </span>
);
