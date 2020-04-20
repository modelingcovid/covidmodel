import * as React from 'react';

const createStringCorrection = (correction) => (childrenArray) => {
  return childrenArray.map((child) => {
    if (typeof child !== 'string') {
      return child;
    }
    return correction(child);
  });
};

const addHairspacesAroundEmDashes = createStringCorrection((str) =>
  str.replace(/\s—\s/g, ' — ').replace(/—/g, ' — ')
);

const preventWidows = createStringCorrection((str) =>
  str.replace(/ ([^\s]+)$/g, ' $1')
);

const shiftFirstQuote = ([first, ...rest]) => {
  if (typeof first !== 'string' || !first.startsWith('“')) {
    return [first, ...rest];
  }
  return [<span style={{marginLeft: '-0.5ch'}}>{first}</span>, ...rest];
};

const corrections = {
  block: [addHairspacesAroundEmDashes, preventWidows, shiftFirstQuote],
  inline: [addHairspacesAroundEmDashes],
};

const applyTypography = (str, kind = 'block') => {
  return corrections[kind].reduce((s, fn) => fn(s), str);
};

export function formatText(children, kind = 'block') {
  const childrenArray = React.Children.toArray(children);
  return corrections[kind].reduce((children, correction) => {
    return correction(children);
  }, childrenArray);
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
export const Instruction = createTextComponent('p', 'paragraph instruction');
export const Title = createTextComponent('h2', 'text-title clear');
export const Heading = createTextComponent('h3', 'section-heading');
export const FigureHeading = createTextComponent('h4', 'figure-heading');
export const OrderedList = createTextComponent('ol', 'paragraph ordered-list');
export const UnorderedList = createTextComponent(
  'ul',
  'paragraph unordered-list'
);
export const ListItem = createTextComponent('li');
