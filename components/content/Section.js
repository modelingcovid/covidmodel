import * as React from 'react';
import {theme} from '../../styles';

export const Section = React.forwardRef(({children, ...props}, ref) => (
  <section {...props} ref={ref}>
    <style jsx>{`
      section {
        padding-left: ${theme.gutterWidth};
        padding-right: ${theme.gutterWidth};
        margin-left: auto;
        margin-right: auto;
        max-width: ${theme.maxWidth};
        width: 100%;
      }
    `}</style>
    {children}
  </section>
));
