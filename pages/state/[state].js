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
  SEIR,
} from '../../components';
import {Controls} from '../../components/configured';
import {Section} from '../../components/content';
import {NearestDataProvider} from '../../components/graph';
import {ModelDataProvider} from '../../components/modeling';
import {useComponentId, useContentRect} from '../../components/util';
import {stateLabels} from '../../lib/controls';
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
    return <>Missing data for {state}</>;
  }

  const scenarioSummary = data.scenarios[scenario].summary;

  const socialDistancingGradientId = useComponentId('socialDistancingGradient');
  const stateName = stateLabels[state];

  return (
    <Layout states={states}>
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
          <Head>
            <title>{stateName} COVID model forecast</title>
            <meta
              name="Description"
              content={`A projection of COVID 19 cases in ${stateName} under various scenarios of social distancing.`}
            />
          </Head>
          <style jsx>{`
            .controls {
              padding: var(--spacing1) 0;
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

            <Section className="margin-top-4">
              <div className="text-jumbo margin-bottom-2">{stateName}</div>
              <ModelInputs width={width} height={160} />
              <div
                className="text-title margin-top-4"
                style={{marginBottom: '-64px'}}
              >
                Projections
              </div>
              <SEIR width={width} height={height} />
              <CaseProgressionCurve width={width} height={height} />
              <ProjectedDeaths width={width} height={height} />
              <HospitalCapacity width={width} height={height} />
              <ICUCapacity width={width} height={height} />
            </Section>
          </div>
        </NearestDataProvider>
      </ModelDataProvider>
    </Layout>
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
