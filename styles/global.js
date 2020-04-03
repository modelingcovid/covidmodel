import * as React from 'react';
import css from 'styled-jsx/css';
import {
  declarations,
  breakpoint,
  mediaQuery,
  properties,
  darkMode,
} from './theme';
import {px, toRootRule} from './util';

export const globalStyles = css.global`
  ${toRootRule(declarations)}

  @media ${breakpoint.tabletUp} {
    ${toRootRule(
      px({
        [properties.font.size.jumbo]: 64,
        [properties.font.size.title]: 24,
        [properties.font.size.subtitle]: 20,
      })
    )}
  }
  @media ${mediaQuery.darkMode} {
    ${toRootRule(darkMode)}
  }
  @media (min-width: 896px) {
    :root {
      ${properties.maxWidth}: 896px;
    }
  }
`;
