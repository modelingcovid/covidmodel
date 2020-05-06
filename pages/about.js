import * as React from 'react';
import {getStatesWithData, getBacktestResults} from '../lib/data';
import {Layout, BacktestTable} from '../components';
import {Section} from '../components/content';
import {About} from '../md';

export default function Index({backtest}) {
  return (
    <Layout>
      <About />
      {/* <Section>
        <BacktestTable data={backtest} />
      </Section> */}
    </Layout>
  );
}

export const getStaticProps = async () => {
  const states = getStatesWithData();
  const backtest = await getBacktestResults();

  return {
    props: {
      states,
      backtest,
    },
  };
};
