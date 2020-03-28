import '../styles/main.css';
import {ComponentIdProvider} from '../components/useComponentId';

export default function MyApp({Component, pageProps}) {
  return (
    <ComponentIdProvider>
      <Component {...pageProps} />
    </ComponentIdProvider>
  );
}
