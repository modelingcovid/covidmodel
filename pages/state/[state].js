import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import dayjs from 'dayjs';
import numeral from 'numeral';
import Link from 'next/link';

import {
  Controls,
  DistancingGradient,
  DistancingGraph,
  HospitalCapacity,
  Layout,
  Legend,
  OccupancyGraph,
  PopulationGraph,
  Section,
} from '../../components';
import {Line, Points} from '../../components/graph';
import {useComponentId, useContentRect} from '../../components/util';
import {getStateData, getStatesWithData} from '../../lib/data';
import {getDate} from '../../lib/date';
import {stateLabels} from '../../lib/controls';

const {useCallback, useRef, useState} = React;

const getDistancing = ({distancing}) => distancing;
const getConfirmedPcr = ({confirmedPcr}) => confirmedPcr;
const getConfirmedDeaths = ({confirmedDeaths}) => confirmedDeaths;
const getProjectedPcr = ({projectedPcr}) => projectedPcr;
const getProjectedCurrentlyInfected = ({projectedCurrentlyInfected}) =>
  projectedCurrentlyInfected;
const getProjectedCurrentlyInfectious = ({projectedCurrentlyInfectious}) =>
  projectedCurrentlyInfectious;
const getProjectedDeaths = ({projectedDeaths}) => projectedDeaths;
const getProjectedCurrentlyCritical = ({projectedCurrentlyCritical}) =>
  projectedCurrentlyCritical;
const getProjectedCurrentlyCriticalLCI = ({projectedCurrentlyCriticalLCI}) =>
  projectedCurrentlyCriticalLCI;
const getProjectedCurrentlyCriticalUCI = ({projectedCurrentlyCriticalUCI}) =>
  projectedCurrentlyCriticalUCI;

export default ({data, states}) => {
  const {
    query: {state},
    push,
  } = useRouter();
  const [scenario, setScenario] = useState('scenario1');
  const controlRef = useRef(null);
  const controlRect = useContentRect(controlRef, {width: 896, height: 126});

  const sizeRef = useRef(null);
  const sizeRect = useContentRect(sizeRef, {width: 896, height: 360});
  // TODO(koop): Move gutter calculations
  const width = sizeRect.width + 64 * 2;
  const height = 360;

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
        .sticky-overlay {
          z-index: 1;
          box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
          height: 64px;
          margin-bottom: -64px;
        }
        .controls {
          padding: var(--spacing-02) 0;
        }
        .sticky-inlay {
          padding: var(--spacing-01) 0;
          z-index: 1;
        }
        .section {
          padding-bottom: 128px;
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
        <div className="sticky-overlay" />
        <div>
          <div className="text-subtitle sticky-inlay">
            <Section>Based on these inputs</Section>
          </div>
          <Section>
            <div ref={sizeRef} className="section">
              <div>
                <div>
                  <div>
                    <div className="section-heading">Social Distancing</div>
                    <p className="paragraph">
                      On the left axis social distance of 100% means no contact
                      with others, which yields an R0 (basic reproduction
                      number) for the virus of zero, since it cannot find new
                      hosts. The zero-percent distance is the un-inhibited
                      reproduction number which is thought to be around 3.1.
                    </p>
                    <DistancingGraph
                      scenario={scenario}
                      data={data}
                      x={getDate}
                      y={getDistancing}
                      leftLabel="Social distance"
                      rightLabel="R0"
                      width={width}
                      height={height}
                    >
                      <DistancingGradient
                        id={socialDistancingGradientId}
                        y={getDistancing}
                      />
                    </DistancingGraph>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="section-heading">
                      Demographic Parameters
                    </div>
                    <p className="paragraph">
                      Demographic parameters are calculated based on publically
                      available data on age distributions and hospital capacity.
                      The hospitalization probabilities are computed based on
                      assumed age-based need and state age distributions.
                    </p>
                    <table className="table-fixed mb-0 mb-4 border-2 border-gray-600">
                      <tbody>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Population
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(data.Population).format('0,0')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            ICU Beds
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(data.icuBeds).format('0,0')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Available Hospital Beds
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(
                              data.staffedBeds * (1 - data.bedUtilization)
                            ).format('0,0')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Probability of Not needing hospitalization
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(data.pS).format('0.00%')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Probability of needing hospitalization wihtout ICU
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(data.pH).format('0.00%')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Probability of needing ICU care
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(data.pC).format('0.00%')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div>
                      <div className="section-heading">
                        Model-fit Parameters
                      </div>
                      <div className="text-gray-800 text-sm mb-4">
                        Most parameters{' '}
                        <Link href="/about">
                          <a className="text-blue-700 hover:text-blue-500 leading-relaxed font-medium mb-8">
                            were fit
                          </a>
                        </Link>{' '}
                        on country data, but we adjust the following parameters
                        on a per-state basis for a more accurate fit.
                      </div>
                      <table className="table-fixed border-2 border-gray-600">
                        <tbody>
                          <tr>
                            <td className="font-semibold border px-4 py-2">
                              Import Date
                            </td>
                            <td className="border px-4 py-2">
                              {dayjs('2020-01-01')
                                .add(data.importtime0 - 1, 'day')
                                .format('MMM DD, YYYY')}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold border px-4 py-2">
                              Basic Reproduction Number (R0)
                            </td>
                            <td className="border px-4 py-2">
                              {numeral(data.R0).format('0.00')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
        <div>
          <div className="text-subtitle sticky-inlay">
            <Section>The model predicts…</Section>
          </div>
          <Section>
            <div>
              <div className="flex flex-col">
                <div>
                  <div>
                    <div className="section-heading">
                      Case Progression Curve
                    </div>
                    <p className="paragraph">
                      We show the current number of infected and infectious
                      individuals as well as the cumulative number of expected
                      PCR confirmations. If less than 20% of the population is
                      infected and the number of active infections is reduced to
                      a small fraction of the population we consider the
                      epidemic contained, and place a grey box on the plot.
                    </p>
                    <PopulationGraph
                      scenario={scenario}
                      data={data}
                      x={getDate}
                      xLabel="Case progression curve"
                      width={width}
                      height={height}
                    >
                      <Line
                        y={getProjectedCurrentlyInfected}
                        stroke="#0670de"
                      />
                      <Line
                        y={getProjectedCurrentlyInfectious}
                        stroke="#228403"
                      />
                      <Line y={getProjectedPcr} stroke="#ed6804" />
                      <Points y={getConfirmedPcr} fill="var(--color-gray-03)" />
                    </PopulationGraph>
                    <div style={{paddingTop: '16px'}}>
                      <Legend color="#ed6804">Projected PCR</Legend>
                      <Legend color="#0670de">
                        Projected currently infected
                      </Legend>
                      <Legend color="#228403">
                        Projected currently infectious
                      </Legend>
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="section-heading">Projected deaths</div>
                    <p className="paragraph">
                      We project the cumulative number of deaths on a
                      logarithmic scale. Black dots are confirmed counts.
                    </p>
                    <PopulationGraph
                      scenario={scenario}
                      data={data}
                      x={getDate}
                      xLabel="Projected deaths"
                      width={width}
                      height={height}
                    >
                      <Line y={getProjectedDeaths} stroke="#0670de" />
                      <Points
                        y={getConfirmedDeaths}
                        fill="var(--color-gray-03)"
                      />
                    </PopulationGraph>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div>
                  <HospitalCapacity
                    data={data}
                    scenario={scenario}
                    state={state}
                    width={width}
                    height={height}
                  />
                </div>
                <div>
                  <div>
                    <div className="section-heading">ICU Occupancy</div>
                    <p className="paragraph">
                      Note: we assign a higher probability of fatality in the
                      case the ICU capacity is over-shot. This can be seen in
                      countries like Italy where the fatlity rate is
                      substantially higher even controlling for the age
                      distriubtion.
                    </p>
                    <OccupancyGraph
                      scenario={scenario}
                      data={data}
                      x={getDate}
                      y={getProjectedCurrentlyCritical}
                      y0={getProjectedCurrentlyCriticalLCI}
                      y1={getProjectedCurrentlyCriticalUCI}
                      cutoff={data.icuBeds}
                      xLabel="ICU occupancy"
                      cutoffLabel="ICU capacity"
                      width={width}
                      height={height}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div>
                  <div>
                    <div className="section-heading">Outcome Summary</div>
                    <p className="paragraph">
                      Fatality rate and percent of population infected are the
                      expected PCR confirmed rates with current levels of
                      testing in the US. The infected percentage is expected to
                      be a few times lower than the real rate and the real
                      fatality rate a few times lower to account for unconfirmed
                      mild cases.
                    </p>
                    <table className="table-fixed mb-0 md:mb-4 border-2 border-gray-600">
                      <tbody>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Deaths
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(
                              scenarioSummary.totalProjectedDeaths
                            ).format('0,0')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            PCR Confirmed
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(
                              scenarioSummary.totalProjectedPCRConfirmed
                            ).format('0,0')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Percent of Population Infected
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(
                              scenarioSummary.totalProjectedInfected
                            ).format('0.00%')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Fatality Rate
                          </td>
                          <td className="border px-4 py-2">
                            {numeral(scenarioSummary['Fatality Rate']).format(
                              '0.00%'
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Date Contained
                          </td>
                          <td className="border px-4 py-2">
                            {scenarioSummary['Date Contained'] ===
                            'Not Contained'
                              ? 'Not Contained'
                              : dayjs(scenarioSummary['Date Contained']).format(
                                  'MMM D, YYYY'
                                )}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Date Hospitals Overloaded
                          </td>
                          <td className="border px-4 py-2">
                            {scenarioSummary['Date Hospitals Over Capacity'] ===
                            'ICU Under capacity'
                              ? 'ICU Under capacity'
                              : dayjs(
                                  scenarioSummary[
                                    'Date Hospitals Over Capacity'
                                  ]
                                ).format('MMM D, YYYY')}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold border px-4 py-2">
                            Date ICU Overloaded
                          </td>
                          <td className="border px-4 py-2">
                            {scenarioSummary['Date ICU Over Capacity'] ===
                            'ICU Under capacity'
                              ? 'ICU Under capacity'
                              : dayjs(
                                  scenarioSummary['Date ICU Over Capacity']
                                ).format('MMM D, YYYY')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
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
