import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';
import {Paragraph} from '../content';
import {CurrentStatus} from './CurrentStatus';

const styles = css`
  div {
    color: ${theme.color.gray[2]};
    font-family: ${theme.font.family.ui};
    font-size: ${theme.font.size.micro};
    margin-bottom: ${theme.spacing[1]};
  }
`;

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
      <div>
        <style jsx>{styles}</style>
        <CurrentStatus />
      </div>
    </>
  );
}
