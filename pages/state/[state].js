import * as React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {
  BigPicture,
  Daily,
  EffectiveReproductionNumber,
  FeedbackForm,
  Fitting,
  Hospitalizations,
  ICU,
  Layout,
  ModelInputs,
  OutcomeSummary,
  ParameterTable,
  SummaryTable,
  ProjectedDeaths,
  SEIR,
  Symptomatic,
  TestAndTrace,
} from '../../components';
import {Controls} from '../../components/configured';
import {
  Blockquote,
  Heading,
  Instruction,
  ListItem,
  OrderedList,
  Paragraph,
  Section,
  Title,
  UnorderedList,
  WithCitation,
} from '../../components/content';
import {DistancingGradient} from '../../components/graph';
import {
  DateModelRun,
  ModelDataProvider,
  ModelStateProvider,
  useCreateModelState,
} from '../../components/modeling';
import {Suspense, useContentRect} from '../../components/util';
import {stateLabels} from '../../lib/controls';
import {getStatesWithData} from '../../lib/data';
import {initialTargetDate} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useRef, useState} = React;

const getCurrentlyCritical = ({currentlyCritical}) => currentlyCritical;

export default function StatePage() {
  const {
    query: {state},
  } = useRouter();
  const [scenario, setScenario] = useState('scenario2');

  const sizeRef = useRef(null);
  const {width} = useContentRect(sizeRef, {width: 896, height: 360});
  const height = width > 600 ? 360 : 256;
  const smallHeight = width > 600 ? 256 : 224;

  const stateName = stateLabels[state];

  const interactiveModelState = useCreateModelState({
    locationId: state,
    scenarioId: scenario,
    setScenario: setScenario,
  });

  return (
    <ModelStateProvider value={interactiveModelState}>
      <Layout>
        <Head>
          <title>Modeling COVID-19 in {stateName}</title>
          <meta
            name="Description"
            content={`A projection of COVID 19 cases in ${stateName} under various scenarios of social distancing.`}
          />
        </Head>
        <style jsx>{`
          .controls-container {
            position: sticky;
            z-index: 50;
            top: 51px;
            background: ${theme.color.background};
            box-shadow: 0 2px ${theme.color.shadow[0]};
          }
          .controls {
            padding: var(--spacing1) 0;
          }
        `}</style>

        <div className="flex flex-col justify-center">
          <Section className="margin-top-4 margin-bottom-3">
            <div className="graph-size" ref={sizeRef} />
            <h1 className="text-jumbo margin-bottom-1">
              <span className="nowrap">Modeling COVID-19</span>{' '}
              <span className="nowrap">in {stateName}</span>
            </h1>
            <h2 className="dek margin-bottom-3">
              Forecasting the impact of the virus using models trained with
              actual social distancing, testing, and fatality data
            </h2>

            <Paragraph>
              The COSMC model is an epidemiological model of COVID-19, fit to
              actual social distancing, testing, and fatality data. We use this
              data to project how COVID-19 might spread through a population for
              different <strong>locations</strong> and different{' '}
              <strong>social distancing scenarios</strong>.
            </Paragraph>
            <WithCitation
              citation={
                <>
                  We use data from the{' '}
                  <a href="https://covidtracking.com/">
                    COVID Tracking Project
                  </a>
                  , mobility data from{' '}
                  <a href="https://www.google.com/covid19/mobility/">Google</a>,
                  hospital capacity data from{' '}
                  <a href="https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds?geometry=52.207%2C-16.820%2C-77.168%2C72.123">
                    Esri
                  </a>
                  , and demographic data from{' '}
                  <a href="https://www.wolfram.com/language/12/financial-and-socioeconomic-entities/access-detailed-us-census-data.html">
                    Wolfram
                  </a>
                  . The model was last run on <DateModelRun />.
                </>
              }
            >
              <Paragraph>
                <strong>
                  A model is only as good as{' '}
                  <span className="footnote">the data it’s based on,</span>
                </strong>{' '}
                and we’re thankful for the many people and organizations who
                have worked to produce the data that powers the model. That
                said, all data has its caveats and limitations: in particular,
                fatality counts are difficult to assess and are{' '}
                <a href="https://www.nytimes.com/2020/04/05/us/coronavirus-deaths-undercount.html">
                  often underreported
                </a>
                . We’ve tried to make the best of the available data and hope to
                continually improve the model as more data becomes available.
              </Paragraph>
            </WithCitation>
            <Blockquote>
              <em>“All models are wrong, but some are useful.”</em>
            </Blockquote>

            <BigPicture width={width} height={smallHeight} />
          </Section>

          <DistancingGradient width={width} />
          <Section>
            <h2 className="text-jumbo margin-top-5 margin-bottom-1">
              Interacting with the model
            </h2>
            <h3 className="dek margin-bottom-3">
              Select a location and social distancing scenario to model
            </h3>
          </Section>
          <div className="controls-container">
            <Section>
              <div className="controls">
                <Controls />
              </div>
            </Section>
          </div>
          <Section className="margin-top-4">
            <Paragraph>
              <strong>Location</strong> determines the demographic data used by
              the model, including population, existing data about the spread of
              COVID-19 in the region, and historical social distancing levels.
            </Paragraph>
            <Paragraph>
              The <strong>social distancing scenario</strong> models what the
              people and governments in the region might do in the future—how
              socially distanced will they be, and for how long?
            </Paragraph>
            <ModelInputs width={width} height={208} />
            <EffectiveReproductionNumber width={width} height={208} />
            <Fitting width={width} height={height} />
            <Daily width={width} height={height} />
            <Hospitalizations width={width} height={smallHeight} />
            <ICU width={width} height={smallHeight} />
            {/* <TestAndTrace width={width} height={height} /> */}
            <SEIR width={width} height={height} />
            <Symptomatic width={width} height={smallHeight} />
            {/* <ProjectedDeaths width={width} height={height} /> */}
            <ParameterTable />
            <SummaryTable />
          </Section>
          {/* <Section style={{marginTop: '300px'}}>
            <div className="text-jumbo">Work in progress</div>
            <div className="dek margin-top-1">
              These sections are being converted to match the format&nbsp;above.
            </div>
          </Section> */}
        </div>
        <FeedbackForm />
      </Layout>
    </ModelStateProvider>
  );
}

export const getStaticProps = ({params: {state}}) => {
  return {
    props: {},
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
