import * as React from 'react';
import Link from 'next/link';
import {Section} from './Section';
import {Notice} from './Notice';

export const Layout = ({children}) => (
  <div className="layout">
    <style jsx>{`
      .layout {
        padding-bottom: var(--spacing-04);
      }
      header {
        padding: var(--spacing-01) 0;
        display: flex;
        justify-content: space-between;
      }
      .title {
        display: block;
        flex-shrink: 0;
        font-size: 18px;
        font-weight: 600;
      }
      .link {
        margin-left: var(--spacing-01);
      }
      .link:first-of-type {
        margin-left: 0;
      }
      @media (max-width: 559px) {
        header {
          flex-direction: column;
        }
        .title {
          padding-bottom: var(--spacing-01);
        }
      }
    `}</style>
    <Notice>
      Please do not share these values; this model is under active development.
    </Notice>
    <Section>
      <header>
        <Link href="/">
          <a className="focus title color-dark">COVID Modeling Project</a>
        </Link>
        <div className="pages text-small">
          <Link href="/state/NY">
            <a className="focus link">States</a>
          </Link>
          <Link href="/about">
            <a className="focus link">About</a>
          </Link>
        </div>
      </header>
    </Section>
    {children}
  </div>
);
