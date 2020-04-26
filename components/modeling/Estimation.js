import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';
import {Paragraph} from '../content';
import {CurrentStatus} from './CurrentStatus';

export function Estimation({
  children,
  className,
  date,
  status = true,
  ...remaining
}) {
  return (
    <>
      <Paragraph
        {...remaining}
        className={['estimation', className].filter(Boolean).join(' ')}
      >
        {children}
        {status && (
          <span className="caption margin-top-0">
            <CurrentStatus date={date} />
          </span>
        )}
      </Paragraph>
    </>
  );
}
