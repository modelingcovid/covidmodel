import * as React from 'react';
import css from 'styled-jsx/css';
import {
  declarations,
  breakpoint,
  mediaQuery,
  properties,
  tabletUp,
  darkMode,
} from './theme';
import {px, toRootRule} from './util';

export const globalStyles = css.global`
  ${toRootRule(declarations)}

  ${breakpoint.tabletUp} {
    ${toRootRule(tabletUp)}
  }
  ${mediaQuery.darkMode} {
    ${toRootRule(darkMode)}
  }
  @media (min-width: 1024px) {
    :root {
      ${properties.maxWidth}: 1024px;
    }
  }
`;
