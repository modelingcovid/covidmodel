import * as React from 'react';
import {getOverviewData, getStatesWithData, getTopoJsonUS} from '../lib/data';
import {Layout, Overview} from '../components';
import {Section} from '../components/content';
import {Home} from '../md';
import {Test} from '../components/Test';

export default function Index(props) {
  return (
    <Layout>
      <Home />
      <Test />
      <Section>
        <Overview {...props} />
      </Section>
    </Layout>
  );
}

export const getStaticProps = () => {
  const overview = getOverviewData();
  const states = getStatesWithData();
  const topo = getTopoJsonUS();

  return {
    props: {
      overview,
      states,
      topo,
    },
  };
};
