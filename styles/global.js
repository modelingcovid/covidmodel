import * as React from 'react';
import css from 'styled-jsx/css';
import {declarations, tabletUp, properties} from './theme';
import {px} from './util';

const serializeDeclarations = (declarations) =>
  Object.entries(declarations)
    .map(([property, value]) => `${property}: ${value};`)
    .join('\n');

export const globalStyles = css.global`
  :root {
    ${serializeDeclarations(declarations)}
  }
`;
