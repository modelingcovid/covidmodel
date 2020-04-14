import * as React from 'react';
import {getStatesWithData} from '../lib/data';
import {Layout} from '../components';
import {Section} from '../components/content';
import {About} from '../md';

export default function Index() {
  return (
    <Layout>
      <About />
    </Layout>
  );
}

export const getStaticProps = () => ({
  props: {
    states: getStatesWithData(),
  },
});
