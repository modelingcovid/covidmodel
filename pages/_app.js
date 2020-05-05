import * as React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {SWRConfig} from 'swr';
import 'normalize.css';

import {fetchPromise} from '../lib/fetch';
import {globalStyles} from '../styles';

import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';
import {MDXComponents} from '../components';

const {useEffect} = React;

const title = 'Modeling Covid-19';
const browserTitle = title;
const description =
  'Forecasting the impact of Covid-19 using an epidemiological model trained on real world data.';
const canonicalUrl = 'https://modelingcovid.com/';
const socialImgUrl = `${canonicalUrl}social.png`;

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;

export default function App({
  Component,
  pageProps,
  state,
  states: initialStates,
}) {
  const {events} = useRouter();
  useEffect(() => {
    const handler = (url) => {
      if (typeof window !== 'undefined' && typeof window.ga !== 'undefined') {
        window.ga('send', 'pageview');
      }
    };
    events.on('routeChangeComplete', handler);
    return () => events.off('routeChangeComplete', handler);
  }, [events]);

  return (
    <SWRConfig
      value={{
        fetcher: fetchPromise,
      }}
    >
      <ComponentIdProvider>
        <Head>
          {GOOGLE_ANALYTICS_ID && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                ga('create', '${GOOGLE_ANALYTICS_ID.slice(0, 14)}', {
                  'storage': 'none'
                });
                ga('set', 'anonymizeIp', true);
                ga('send', 'pageview');
              `,
              }}
            />
          )}
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
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          />
        </Head>
      </ComponentIdProvider>
    </SWRConfig>
  );
}
