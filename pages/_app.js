import * as React from 'react';
import Head from 'next/head';
import {SWRConfig} from 'swr';
import 'normalize.css';

import {fetchPromise} from '../lib/fetch';
import {globalStyles} from '../styles';

import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';
import {MDXComponents} from '../components';

const {useState} = React;

const title = 'Modeling COVID-19';
const browserTitle = `${title} — The COVID Open Source Modeling Collaboration`;
const description =
  'Forecasting the impact of COVID-19 using models trained with actual social distancing, testing, and fatality data.';
const canonicalUrl = 'https://modelingcovid.com/';
const socialImgUrl = `${canonicalUrl}social.png`;

export default function App({
  Component,
  pageProps,
  state,
  states: initialStates,
}) {
  return (
    <SWRConfig
      value={{
        fetcher: fetchPromise,
      }}
    >
      <ComponentIdProvider>
        <Head>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon@32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon@96.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon@16.png"
          />

          <title>{browserTitle}</title>
          <meta name="description" content={description} />

          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={socialImgUrl} />
          <meta property="og:url" content={canonicalUrl} />

          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={socialImgUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <style jsx global>
          {globalStyles}
        </style>
        <MDXComponents>
          <Component {...pageProps} />
        </MDXComponents>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          />
        </Head>
      </ComponentIdProvider>
    </SWRConfig>
  );
}
