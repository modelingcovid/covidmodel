import * as React from 'react';

export const Section = React.forwardRef(({children, ...props}, ref) => (
  <section {...props} ref={ref}>
    <style jsx>{`
      section {
        padding: 0 var(--gutter-width);
        margin: 0 auto;
        max-width: var(--max-width);
        width: 100%;
      }
    `}</style>
    {children}
  </section>
));
