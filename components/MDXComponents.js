import React from 'react';
import Link from 'next/link';
import {MDXProvider} from '@mdx-js/react';
import {
  Blockquote,
  ListItem,
  OrderedList,
  Paragraph,
  Section,
  UnorderedList,
  createTextComponent,
} from './content';

export const MDXComponents = ({children}) => {
  return (
    <MDXProvider
      components={{
        wrapper: Section,
        h1: createTextComponent(
          'h1',
          'text-jumbo margin-top-5 margin-bottom-2'
        ),
        h2: createTextComponent('h2', 'text-title margin-top-4'),
        h3: createTextComponent('h3', 'section-heading margin-top-3'),
        h4: createTextComponent('h4', ''),
        h5: createTextComponent('h5', ''),
        h6: createTextComponent('h6', ''),
        p: Paragraph,
        a: createTextComponent('a', 'link', 'inline'),
        blockquote: Blockquote,
        ul: UnorderedList,
        ol: OrderedList,
        li: ListItem,
        strong: createTextComponent('strong', 'weight-600', 'inline'),
        em: createTextComponent('em', 'italic', 'inline'),
      }}
    >
      {children}
    </MDXProvider>
  );
};
