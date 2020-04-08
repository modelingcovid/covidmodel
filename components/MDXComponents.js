import React from 'react';
import Link from 'next/link';
import {MDXProvider} from '@mdx-js/react';
import {Section, createTextComponent} from './content';

export const MDXComponents = ({children}) => {
  return (
    <MDXProvider
      components={{
        wrapper: Section,
        h1: createTextComponent(
          'h1',
          'text-jumbo margin-top-4 margin-bottom-1'
        ),
        h2: createTextComponent('h2', 'section-heading margin-top-4'),
        h3: createTextComponent('h3', ''),
        h4: createTextComponent('h4', ''),
        h5: createTextComponent('h5', ''),
        h6: createTextComponent('h6', ''),
        p: createTextComponent('p', 'paragraph'),
        a: createTextComponent('a', 'link', 'inline'),
        blockquote: createTextComponent('blockquote', ''),
        ul: createTextComponent('ul', 'unordered-list'),
        ol: createTextComponent('ol', 'ordered-list'),
        li: createTextComponent('li', 'text-body'),
        strong: createTextComponent('strong', 'weight-600', 'inline'),
        em: createTextComponent('em', 'italic', 'inline'),
      }}
    >
      {children}
    </MDXProvider>
  );
};
