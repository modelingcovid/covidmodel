import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import dayjs from 'dayjs';
import numeral from 'numeral';
import Link from 'next/link';

import {
  Controls,
  DemographicParameters,
  DistancingGradient,
  DistancingGraph,
  HospitalCapacity,
  Layout,
  Legend,
  ModelFitParameters,
  OccupancyGraph,
  OutcomeSummary,
  PopulationGraph,
  ProjectedDeaths,
  Section,
} from '../../components';
import {Line, Points} from '../../components/graph';
import {useComponentId, useContentRect} from '../../components/util';
import {getStateData, getStatesWithData} from '../../lib/data';
import {getDate} from '../../lib/date';
import {stateLabels} from '../../lib/controls';

const {useCallback, useRef, useState} = React;

const getDistancing = ({distancing}) => distancing;
const getConfirmedPcr = ({cumulativePcr}) => cumulativePcr.confirmed;
const getProjectedPcr = ({cumulativePcr}) => cumulativePcr.projected;
const getProjectedCurrentlyInfected = ({currentlyInfected}) =>
  currentlyInfected.projected;
const getProjectedCurrentlyInfectious = ({currentlyInfectious}) =>
  currentlyInfectious.projected;
const getProjectedCurrentlyCritical = ({currentlyCritical}) =>
  currentlyCritical.projected;
const getProjectedCurrentlyCriticalLCI = ({currentlyCritical}) =>
  currentlyCritical.lci;
const getProjectedCurrentlyCriticalUCI = ({currentlyCritical}) =>
  currentlyCritical.uci;

export default ({data, states}) => {
  const {
    query: {state},
    push,
  } = useRouter();
  const [scenario, setScenario] = useState('scenario1');
  const controlRef = useRef(null);
  const controlRect = useContentRect(controlRef, {width: 896, height: 126});

  const sizeRef = useRef(null);
  const {width} = useContentRect(sizeRef, {width: 896, height: 360});
  const height = width > 600 ? 360 : 256;

  if (!data) {
    return <Layout noPad>Missing data for {state}</Layout>;
  }

  const scenarioSummary = data[scenario].summary;

  const handleStateSelect = (e) => {
    push(`/state/${e.target.value}`);
  };

  const socialDistancingGradientId = useComponentId('socialDistancingGradient');

  return (
    <Layout>
      <Head>
        <title>{states[state]} COVID model forecast</title>
        <meta
          name="Description"
          content={`A projection of COVID 19 cases in ${states[state]} under various scenarios of social distancing.`}
        />
      </Head>
      <style jsx>{`
        .sticky,
        .sticky-overlay,
        .sticky-inlay {
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }
        .sticky-overlay,
        .sticky-inlay {
          display: none;
        }
        .sticky-overlay,
        .sticky-overlay-shadow {
          height: 42px;
        }
        .sticky-overlay {
          z-index: 1;
          margin-bottom: -42px;
        }
        .sticky-overlay-shadow {
          box-shadow: 0 2px rgba(0, 0, 0, 0.04);
        }
        .controls {
          padding-top: var(--spacing-01);
        }
        .sticky-inlay {
          background: transparent;
          z-index: 1;
          margin-bottom: var(--spacing-02);
        }
        .text-jumbo {
          padding-top: 96px;
          margin-bottom: -64px;
        }
      `}</style>
      <style jsx>{`
        .sticky-overlay,
        .sticky-inlay {
          top: calc(${controlRect.height}px);
        }
      `}</style>
      <div className="flex flex-col justify-center">
        <div className="sticky" ref={controlRef}>
          <Section>
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
        <div className="sticky-overlay">
          <Section>
            <div className="sticky-overlay-shadow" />
          </Section>
        </div>
        <div>
          <div className="sticky-inlay">
            <Section>
              <span className="section-label">Based on these inputs</span>
            </Section>
          </div>
          <Section>
            <div className="text-jumbo">Model inputs</div>
            <div ref={sizeRef}>
              <div className="section-heading">Social distancing</div>
              <p className="paragraph">
                On the left axis social distance of 100% means no contact with
                others, which yields an R0 (basic reproduction number) for the
                virus of zero, since it cannot find new hosts. The zero-percent
                distance is the un-inhibited reproduction number which is
                thought to be around 3.1.
              </p>
              <DistancingGraph
                scenario={scenario}
                data={data}
                x={getDate}
                y={getDistancing}
                leftLabel="distancing"
                rightLabel="R0"
                width={width}
                height={height}
              />
            </div>
            <DemographicParameters data={data} />
            <ModelFitParameters data={data} />
          </Section>
        </div>
        <div>
          <div className="sticky-inlay">
            <Section>
              <span className="section-label">The model projects</span>
            </Section>
          </div>
          <Section>
            <div className="text-jumbo">Projections</div>
            <div>
              <div className="section-heading">Case progression curve</div>
              <p className="paragraph">
                We show the current number of infected and infectious
                individuals as well as the cumulative number of expected PCR
                confirmations. If less than 20% of the population is infected
                and the number of active infections is reduced to a small
                fraction of the population we consider the epidemic contained,
                and place a grey box on the plot.
              </p>
              <PopulationGraph
                scenario={scenario}
                data={data}
                x={getDate}
                xLabel="people"
                width={width}
                height={height}
              >
                <Line y={getProjectedCurrentlyInfected} stroke="#0670de" />
                <Line y={getProjectedCurrentlyInfectious} stroke="#228403" />
                <Line y={getProjectedPcr} stroke="#ed6804" />
                <Points y={getConfirmedPcr} fill="var(--color-gray-03)" />
              </PopulationGraph>
              <div style={{paddingTop: '16px'}}>
                <Legend color="#ed6804">Projected PCR</Legend>
                <Legend color="#0670de">Projected currently infected</Legend>
                <Legend color="#228403">Projected currently infectious</Legend>
              </div>
            </div>
            <ProjectedDeaths
              data={data}
              scenario={scenario}
              state={state}
              width={width}
              height={height}
            />
            <HospitalCapacity
              data={data}
              scenario={scenario}
              state={state}
              width={width}
              height={height}
            />
            <div>
              <div className="section-heading">ICU Occupancy</div>
              <p className="paragraph">
                Note: we assign a higher probability of fatality in the case the
                ICU capacity is over-shot. This can be seen in countries like
                Italy where the fatlity rate is substantially higher even
                controlling for the age distriubtion.
              </p>
              <OccupancyGraph
                scenario={scenario}
                data={data}
                x={getDate}
                y={getProjectedCurrentlyCritical}
                y0={getProjectedCurrentlyCriticalLCI}
                y1={getProjectedCurrentlyCriticalUCI}
                cutoff={data.icuBeds}
                xLabel="people"
                cutoffLabel="ICU capacity"
                width={width}
                height={height}
              />
            </div>
            <OutcomeSummary data={scenarioSummary} />
          </Section>
        </div>
      </div>
    </Layout>
  );
};

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
