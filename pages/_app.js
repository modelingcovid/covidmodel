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
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
    </ComponentIdProvider>
  );
}
