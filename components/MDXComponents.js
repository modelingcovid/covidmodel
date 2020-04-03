import React from 'react';
import Link from 'next/link';
import {MDXProvider} from '@mdx-js/react';
import {Section} from './content';

const tagWithClassName = (Tag, className) => ({children, ...props}) => (
  <Tag {...props} className={className}>
    {children}
  </Tag>
);

export const MDXComponents = ({children}) => {
  return (
    <MDXProvider
      components={{
        wrapper: Section,
        h1: tagWithClassName('h1', 'text-jumbo margin-top-3 margin-bottom-1'),
        h2: tagWithClassName('h2', 'section-heading margin-top-3'),
        h3: tagWithClassName(
          'h3',
          'text-gray-800 mt-12 mb-4 -ml-1 text-lg font-bold'
        ),
        h4: tagWithClassName(
          'h4',
          'text-gray-800 mt-12 mb-4 -ml-1 text-lg font-semibold'
        ),
        h5: tagWithClassName(
          'h5',
          'text-gray-800 mt-12 mb-4 -ml-1 text-lg font-medium'
        ),
        h6: tagWithClassName(
          'h6',
          'text-gray-800 mt-12 mb-4 -ml-1 text-base font-semibold'
        ),
        p: tagWithClassName('p', 'paragraph'),
        a: tagWithClassName(
          'a',
          'text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8'
        ),
        blockquote: tagWithClassName(
          'blockquote',
          'border-solid border-l-4 border-gray-300 pl-4'
        ),
        ul: tagWithClassName('ul', 'list-disc m-4'),
        ol: tagWithClassName('ol', 'list-decimal m-4'),
        li: tagWithClassName('li', 'text-body'),
        strong: tagWithClassName('strong', 'font-semibold'),
        em: tagWithClassName('em', 'italic'),
      }}
    >
      {children}
    </MDXProvider>
  );
};
