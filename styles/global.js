import * as React from 'react';
import css from 'styled-jsx/css';
import {declarations, breakpoint, properties} from './theme';
import {px, toRootRule} from './util';

export const globalStyles = css.global`
  ${toRootRule(declarations)}
  ${breakpoint.tabletUp} {
    ${toRootRule(
      px({
        [properties.font.size.jumbo]: 64,
        [properties.font.size.title]: 24,
        [properties.font.size.subtitle]: 20,
      })
    )}
  }
`;
