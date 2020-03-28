import React from 'react';
import {MDXProvider} from '@mdx-js/react';

const tagWithClassName = (Tag, className) => ({children, ...props}) => (
  <Tag {...props} className={className}>
    {children}
  </Tag>
);

export const MDXComponents = ({children}) => {
  return (
    <MDXProvider
      components={{
        h1: tagWithClassName(
          'h1',
          'text-gray-800 mt-12 mb-4 -ml-1 text-xl font-extrabold tracking-wider'
        ),
        h2: tagWithClassName(
          'h2',
          'text-gray-800 mt-12 mb-4 -ml-1 text-xl font-bold tracking-wide'
        ),
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
        p: tagWithClassName(
          'p',
          'text-gray-800 leading-relaxed font-light mt-2 mb-4'
        ),
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
        li: tagWithClassName('li', 'text-gray-800 font-light my-1'),
        strong: tagWithClassName('strong', 'font-semibold'),
        em: tagWithClassName('em', 'italic'),
      }}
    >
      {children}
    </MDXProvider>
  );
};
