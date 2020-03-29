import '../styles/main.css';
import {ComponentIdProvider} from '../components/util';

export default function MyApp({Component, pageProps}) {
  return (
    <ComponentIdProvider>
      <Component {...pageProps} />
    </ComponentIdProvider>
  );
}
