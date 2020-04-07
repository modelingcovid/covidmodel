import React from 'react';
import Link from 'next/link';
import {MDXProvider} from '@mdx-js/react';
import {Section, formatText} from './content';

const tagWithClassName = (Tag, className) => ({children, ...props}) => (
  <Tag {...props} className={className}>
    {formatText(children)}
  </Tag>
);

export const MDXComponents = ({children}) => {
  return (
    <MDXProvider
      components={{
        wrapper: Section,
        h1: tagWithClassName('h1', 'text-jumbo margin-top-4 margin-bottom-1'),
        h2: tagWithClassName('h2', 'section-heading margin-top-4'),
        h3: tagWithClassName('h3', ''),
        h4: tagWithClassName('h4', ''),
        h5: tagWithClassName('h5', ''),
        h6: tagWithClassName('h6', ''),
        p: tagWithClassName('p', 'paragraph'),
        a: tagWithClassName('a', 'link'),
        blockquote: tagWithClassName(
          'blockquote',
          'border-solid border-l-4 border-gray-300 pl-4'
        ),
        ul: tagWithClassName('ul', 'list-disc list-inside'),
        ol: tagWithClassName('ol', 'list-decimal list-inside'),
        li: tagWithClassName('li', 'text-body'),
        strong: tagWithClassName('strong', 'weight-600'),
        em: tagWithClassName('em', 'italic'),
      }}
    >
      {children}
    </MDXProvider>
  );
};
