import * as React from 'react';

const addHairspacesAroundEmDashes = (str) =>
  str.replace(/\s—\s/g, ' — ').replace(/—/g, ' — ');

const preventWidows = (str) => str.replace(/ ([^\s]+)$/g, ' $1');

const corrections = {
  block: [addHairspacesAroundEmDashes, preventWidows],
  inline: [addHairspacesAroundEmDashes],
};

const applyTypography = (str, kind = 'block') => {
  return corrections[kind].reduce((s, fn) => fn(s), str);
};

export function formatText(children, kind) {
  return React.Children.map(children, (child) => {
    if (typeof child !== 'string') {
      return child;
    }
    return applyTypography(child, kind);
  });
}

export const createTextComponent = (Tag, boundClassName, kind) => ({
  children,
  className,
  ...props
}) => (
  <Tag
    {...props}
    className={[boundClassName, className].filter(Boolean).join(' ')}
  >
    {formatText(children, kind)}
  </Tag>
);

export const Paragraph = createTextComponent('p', 'paragraph');
