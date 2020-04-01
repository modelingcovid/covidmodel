import Link from 'next/link';
import Head from 'next/head';
import {Layout, Section} from '../components';

export default () => (
  <Layout>
    <Head>
      <title>COVID Modeling Project</title>
      <meta
        name="Description"
        content={`COVID-19 forecasting models trained to actual social distancing, PCR test, and fatality data.`}
      />
    </Head>
    <Section>
      <p className="paragraph">
        This site provides guidance on the efficiency of COVID-19 mitigation
        efforts. We've implemented a model for the spread of the virus and fit
        the parameters to data at the country level from the US and Europe. We
        then have created state-level dashboards to help guide decision-making
        when it comes to mitigation efforts and ICU capacity. You can read more
        about the model{' '}
        <Link href="/about">
          <a className="text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8">
            here.
          </a>
        </Link>
      </p>
      <p className="paragraph">
        Start by{' '}
        <Link href="/state/[state]" as="/state/NY">
          <a className="text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8">
            picking a state
          </a>
        </Link>{' '}
        and scenario to see forecasts.
      </p>
      <div>
        <div className="section-heading">Changelog</div>
        <p className="paragraph">
          <em>Coming soon…</em>
        </p>
      </div>
    </Section>
  </Layout>
);
