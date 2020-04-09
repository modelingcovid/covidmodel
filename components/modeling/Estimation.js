import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';
import {Paragraph} from '../content';
import {CurrentStatus} from './CurrentStatus';

export function Estimation({children, className, ...remaining}) {
  return (
    <>
      <Paragraph
        {...remaining}
        className={['estimation margin-bottom-0', className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </Paragraph>
      <div className="caption margin-bottom-1">
        <CurrentStatus />
      </div>
    </>
  );
}
