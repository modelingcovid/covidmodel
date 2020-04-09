import * as React from 'react';
import {Gutter, WithGutter} from './Gutter';
import {createTextComponent} from './Text';

export const Citation = createTextComponent('cite', 'citation');

export function WithCitation({children, citation}) {
  return (
    <WithGutter>
      <div>{children}</div>
      <Gutter>
        <Citation>{citation}</Citation>
      </Gutter>
    </WithGutter>
  );
}
