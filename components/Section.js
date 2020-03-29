import * as React from 'react';

export const Section = ({children, ...props}) => (
  <section {...props}>
    <style jsx>{`
      section {
        padding: 0 var(--spacing-01);
        margin: 0 auto;
        max-width: var(--max-width);
        width: 100%;
      }
    `}</style>
    {children}
  </section>
);
