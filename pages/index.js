import Link from 'next/link';
import Layout from '../components/Layout';

export default () => (
  <Layout>
    <div className="flex flex-col justify-start">
      <div className="mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
        <p className="mb-4">
          This site provides guidance on the efficiency of COVID-19 mitigation
          efforts. We've implemented a model for the spread of the virus and fit
          the parameters to data at the country level from the US and Europe. We
          then have created state-level dashbaords to help guid decision-making
          when it comes to mitigation efforts and ICU capacity.{' '}
        </p>
        <p>
          Start by{' '}
          <Link href="/state">
            <a className="inline text-blue-600">picking a state</a>
          </Link>{' '}
          and scenario to see forecasts.
        </p>
      </div>
      <div className="flex sm:flex-col md:flex-row mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
        <span className="text-bold text-lg">Changelog:</span>
      </div>
    </div>
  </Layout>
);
