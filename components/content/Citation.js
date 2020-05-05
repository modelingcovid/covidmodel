import * as React from 'react';
import {Gutter, WithGutter} from './Gutter';
import {createTextComponent} from './Text';

export const Citation = createTextComponent('cite', 'citation');

export function WithCitation({children, citation}) {
  const citations = Array.isArray(citation) ? citation : [citation];
  return (
    <WithGutter
      gutter={citations.map((citation, i) => (
        <Citation key={i}>{citation}</Citation>
      ))}
    >
      {children}
    </WithGutter>
  );
}
