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
  ParameterTable,
  ProjectedDeaths,
  SEIR,
} from '../../components';
import {Controls} from '../../components/configured';
import {Section, Title} from '../../components/content';
import {NearestDataProvider, DistancingGradient} from '../../components/graph';
import {ModelDataProvider, ModelStateProvider} from '../../components/modeling';
import {useContentRect} from '../../components/util';
import {stateLabels} from '../../lib/controls';
import {getStateData, getStatesWithData} from '../../lib/data';
import {getDate, initialTargetDate} from '../../lib/date';
import {theme} from '../../styles';

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
  const stateName = stateLabels[state];

  return (
    <Layout>
      <ModelStateProvider
        locationId={state}
        scenarioId={scenario}
        setScenario={setScenario}
      >
        <NearestDataProvider
          x={getDate}
          data={data.scenarios[scenario].timeSeriesData}
          initial={initialTargetDate}
        >
          <Head>
            <title>{stateName} COVID model forecast</title>
            <meta
              name="Description"
              content={`A projection of COVID 19 cases in ${stateName} under various scenarios of social distancing.`}
            />
          </Head>
          <style jsx>{`
            .controls-container {
              position: sticky;
              z-index: 50;
              top: 52px;
              background: ${theme.color.background};
            }
            .controls {
              padding: var(--spacing1) 0;
              box-shadow: 0 2px ${theme.color.shadow[0]};
            }
          `}</style>
          <svg
            viewBox={`0 0 ${width} 0`}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <DistancingGradient size={width} />
          </svg>
          <div className="flex flex-col justify-center">
            <Section className="margin-top-4">
              <div ref={sizeRef} />
              <div className="text-jumbo margin-bottom-1">
                <span className="nowrap">Modeling COVID-19</span>{' '}
                <span className="nowrap">in {stateName}</span>
              </div>
              <div className="dek margin-bottom-3">
                Forecasting models trained to actual social distancing, testing,
                and fatality data
              </div>

              <p className="paragraph">
                Our model has two primary variables: <strong>location</strong>{' '}
                and <strong>social distancing scenario</strong>. We use location
                to determine the demographic data we use, including population,
                existing data about the spread of COVID-19 in the region, and
                historical social distancing levels. The social distancing
                scenario models what the people and governments in the region
                might do in the future: how socially distanced will they be, and
                for how long?
                {/* Every model makes assumptions: we’ve attempted to explain o */}
              </p>
            </Section>
            <div className="controls-container">
              <Section>
                <div className="controls">
                  <Controls />
                </div>
              </Section>
            </div>
            <Section className="margin-top-3">
              {/* <ModelInputs width={width} height={160} />
              <SEIR width={width} height={height} /> */}
              <CaseProgressionCurve width={width} height={height} />
              {/* <ProjectedDeaths width={width} height={height} /> */}
              <ParameterTable />
            </Section>
            {/* <Section style={{marginTop: '300px'}}>
              <Title>
                Work in progress: these sections are being converted to match
                the format above
              </Title>
              <HospitalCapacity width={width} height={height} />
              <ICUCapacity width={width} height={height} />
            </Section> */}
          </div>
        </NearestDataProvider>
      </ModelStateProvider>
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
