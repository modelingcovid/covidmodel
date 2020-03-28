import '../styles/main.css';
import {ComponentIdProvider} from '../lib/useComponentId';

export default function MyApp({Component, pageProps}) {
  return (
    <ComponentIdProvider>
      <Component {...pageProps} />
    </ComponentIdProvider>
  );
}
