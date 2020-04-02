import * as React from 'react';
import {ExclamationTriangle} from './icon';
import {Section} from './Section';

export const Notice = ({children}) => (
  <div className="notice">
    <style jsx>{`
      .notice {
        background: var(--color-red2);
        padding: 8px 0;
      }
      .content {
        display: flex;
      }
      .icon {
        flex-shrink: 0;
      }
      span {
        color: white;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        padding-left: 16px;
      }
    `}</style>
    <Section>
      <div className="content">
        <span className="icon">
          <ExclamationTriangle fill="white" />
        </span>
        <span>{children}</span>
      </div>
    </Section>
  </div>
);
