import React from 'react';
import Link from 'next/link';
import {Section} from './Section';

export const Layout = ({children, noPad = false}) => (
  <div>
    <style jsx>{`
      nav {
        padding: 16px 0;
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
    `}</style>
    <Section>
      <nav className="section">
        <Link href="/">
          <a className="focus title color-dark">COVID Modeling Project</a>
        </Link>
        <div className="pages text-small">
          <Link href="/state">
            <a className="focus link">States</a>
          </Link>
          <Link href="/country">
            <a className="focus link">Countries</a>
          </Link>
          <Link href="/about">
            <a className="focus link">About</a>
          </Link>
        </div>
      </nav>
    </Section>
    {children}
  </div>
);
