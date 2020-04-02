import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

const styles = css`
  div {
    font-style: italic;
    font-size: ${theme.font.size.body};
    font-family: ${theme.font.family.text};
    color: ${theme.color.gray[1]};
  }
`;

export const Label = ({children}) => (
  <div>
    <style jsx>{styles}</style>
    {children}
  </div>
);
