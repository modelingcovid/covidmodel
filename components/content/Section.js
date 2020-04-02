import * as React from 'react';
import {theme} from '../../styles';

export const Section = React.forwardRef(({children, ...props}, ref) => (
  <section {...props} ref={ref}>
    <style jsx>{`
      section {
        padding: 0 ${theme.gutterWidth};
        margin: 0 auto;
        max-width: ${theme.maxWidth};
        width: 100%;
      }
    `}</style>
    {children}
  </section>
));
