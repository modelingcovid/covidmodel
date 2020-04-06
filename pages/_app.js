import * as React from 'react';
import Head from 'next/head';

import {globalStyles} from '../styles';

import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';
import {MDXComponents} from '../components';

const {useState} = React;

export default function App({
  Component,
  pageProps,
  state,
  states: initialStates,
}) {
  return (
    <ComponentIdProvider>
      <Head>
        <title>
          Modeling COVID-19 — The COVID Open Source Modeling Collaboration
        </title>
        <meta
          name="description"
          content="COVID-19 forecasting models trained to actual social distancing, PCR tests, and fatality data."
        />
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
  );
}
