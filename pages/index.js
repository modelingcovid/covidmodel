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
          then have created state-level dashboards to help guide decision-making
          when it comes to mitigation efforts and ICU capacity. You can read
          more about the model{' '}
          <Link href="/about">
            <a className="text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8">
              here.
            </a>
          </Link>
        </p>
        <p>
          Start by{' '}
          <Link href="/state">
            <a className="text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8">
              picking a state
            </a>
          </Link>{' '}
          and scenario to see forecasts.
        </p>
      </div>
      <div className="flex sm:flex-col md:flex-row mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
        <span className="text-bold text-gray-600 text-lg">Changelog</span>
      </div>
    </div>
  </Layout>
);
