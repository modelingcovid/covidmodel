import * as React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {
  CaseProgressionCurve,
  HospitalCapacity,
  ICUCapacity,
  Layout,
  ModelInputs,
  OutcomeSummary,
  ProjectedDeaths,
} from '../../components';
import {Controls} from '../../components/configured';
import {Section} from '../../components/content';
import {NearestDataProvider} from '../../components/graph';
import {ModelDataProvider} from '../../components/modeling';
import {useComponentId, useContentRect} from '../../components/util';
import {getStateData, getStatesWithData} from '../../lib/data';
import {getDate, today} from '../../lib/date';

const {useCallback, useRef, useState} = React;

const getCurrentlyCritical = ({currentlyCritical}) => currentlyCritical;

export default function StatePage({data, states}) {
  const {
    query: {state},
  } = useRouter();
  const [scenario, setScenario] = useState('scenario1');

  const sizeRef = useRef(null);
  const {width} = useContentRect(sizeRef, {width: 896, height: 360});
  const height = width > 600 ? 360 : 256;

  if (!data) {
    return <Layout noPad>Missing data for {state}</Layout>;
  }

  const scenarioSummary = data.scenarios[scenario].summary;

  const socialDistancingGradientId = useComponentId('socialDistancingGradient');

  return (
    <ModelDataProvider
      model={data}
      scenario={scenario}
      state={state}
      states={states}
      x={getDate}
    >
      <NearestDataProvider
        x={getDate}
        data={data.scenarios[scenario].timeSeriesData}
        initial={today}
      >
        <Layout>
          <Head>
            <title>{states[state]} COVID model forecast</title>
            <meta
              name="Description"
              content={`A projection of COVID 19 cases in ${states[state]} under various scenarios of social distancing.`}
            />
          </Head>
          <style jsx>{`
            .sticky {
              position: sticky;
              top: 0;
              background: var(--color-background);
              z-index: 2;
            }
            .controls {
              padding: var(--spacing1) 0;
            }
            .text-jumbo {
              margin-bottom: -64px;
            }
          `}</style>
          <div className="flex flex-col justify-center">
            <div className="sticky">
              <Section>
                <div ref={sizeRef} />
                <div className="controls">
                  <Controls
                    state={state}
                    states={states}
                    scenario={scenario}
                    setScenario={setScenario}
                  />
                </div>
              </Section>
            </div>

            <ModelInputs width={width} height={160} />

            <Section className="margin-top-4">
              <div className="text-jumbo">Projections</div>
              <CaseProgressionCurve width={width} height={height} />
              <ProjectedDeaths width={width} height={height} />
              <HospitalCapacity width={width} height={height} />
              <ICUCapacity width={width} height={height} />
              <OutcomeSummary data={scenarioSummary} />
            </Section>
          </div>
        </Layout>
      </NearestDataProvider>
    </ModelDataProvider>
  );
}

export const getStaticProps = ({params: {state}}) => {
  const data = getStateData(state);

  return {
    props: {
      data,
      states: getStatesWithData(),
    },
  };
};

export const getStaticPaths = (_ctx) => {
  return {
    paths: getStatesWithData().map((state) => ({
      params: {state},
    })),
    fallback: false,
  };
};
