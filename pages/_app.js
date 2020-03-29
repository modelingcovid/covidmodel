import Head from 'next/head';
import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';

export default function MyApp({Component, pageProps}) {
  return (
    <ComponentIdProvider>
      <Component {...pageProps} />
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </Head>
    </ComponentIdProvider>
  );
}
