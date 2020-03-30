import Head from 'next/head';
import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';

export default function MyApp({Component, pageProps}) {
  return (
    <ComponentIdProvider>
      <Component {...pageProps} />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Serif:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
    </ComponentIdProvider>
  );
}
