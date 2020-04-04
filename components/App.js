import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {Section} from './content';
import {MDXComponents} from './MDXComponents';
import {Notice} from './Notice';

export const App = ({children}) => (
  <MDXComponents>
    <Head>
      <title>
        Modeling COVID-19 — The COVID Open Source Modeling Collaboration
      </title>
      <meta
        name="description"
        content="COVID-19 forecasting models trained to actual social distancing, PCR tests, and fatality data."
      />
    </Head>
    <div className="layout">
      <style jsx>{`
        .layout {
          padding-bottom: var(--spacing4);
        }
        header {
          padding: var(--spacing1) 0;
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
          margin-left: var(--spacing1);
        }
        .link:first-of-type {
          margin-left: 0;
        }
        @media (max-width: 559px) {
          header {
            flex-direction: column;
          }
          .title {
            padding-bottom: var(--spacing1);
          }
        }
      `}</style>
      <Notice>
        Please do not share these values; this model is under active
        development.
      </Notice>
      <Section>
        <header>
          <Link href="/">
            <a className="focus title color-dark">COVID Modeling Project</a>
          </Link>
          <div className="pages text-small">
            <Link href="/about">
              <a className="focus link">About</a>
            </Link>
          </div>
        </header>
      </Section>
      {children}
    </div>
  </MDXComponents>
);
