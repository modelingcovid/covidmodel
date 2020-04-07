import * as React from 'react';

const addHairspacesAroundEmDashes = (str) =>
  str.replace(/\s—\s/g, ' — ').replace(/—/g, ' — ');

const preventWidows = (str) => str.replace(/ ([^\s]+)$/g, ' $1');

const applyTypography = (str) =>
  [addHairspacesAroundEmDashes, preventWidows].reduce((s, fn) => fn(s), str);

export function formatText(children) {
  return React.Children.map(children, (child) => {
    if (typeof child !== 'string') {
      return child;
    }
    return applyTypography(child);
  });
}

export function Paragraph({children, className, ...remaining}) {
  return (
    <p {...remaining} className={`paragraph ${className}`}>
      {formatText(children)}
    </p>
  );
}
