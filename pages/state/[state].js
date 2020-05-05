import * as React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {
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
import {Contact, Controls, useGraphSize} from '../../components/configured';
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
  WithGutter,
} from '../../components/content';
import {
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
  const [scenario, setScenario] = useState('scenario1');

  const {ref: sizeRef, width, height} = useGraphSize();

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
          <title>Modeling Covid-19 in {stateName}</title>
          <meta
            name="Description"
            content={`A projection of Covid 19 cases in ${stateName} under various scenarios of social distancing.`}
          />
        </Head>
        <style jsx>{`
          .controls-container {
            position: sticky;
            z-index: 50;
            top: 48px;
            background: ${theme.color.background};
          }
          .controls {
            margin: 0 calc(-1 * ${theme.spacing[1]});
            padding: ${theme.spacing[1]};
            background: ${theme.color.gray.bg};
            box-shadow: 0 0 0 2px ${theme.color.shadow[0]};
          }
          @media (min-width: 1040px) {
            .controls {
              margin: 0 calc(-1 * ${theme.spacing[2]});
              padding: ${theme.spacing[1]} ${theme.spacing[2]};
              border-radius: 3px;
            }
          }
        `}</style>

        <div className="flex flex-col justify-center">
          <Section className="margin-top-4 margin-bottom-3">
            <div className="graph-size" ref={sizeRef} />
            <h1 className="text-jumbo margin-bottom-1">
              <span className="nowrap">Modeling Covid-19</span>{' '}
              <span className="nowrap">in {stateName}</span>
            </h1>
            <h2 className="dek margin-bottom-3">
              Forecasting the impact of the virus using models trained with
              actual social distancing, testing, and fatality data
            </h2>
          </Section>
          <div className="controls-container">
            <Section>
              <div className="controls">
                <Controls />
              </div>
            </Section>
          </div>
          <Section className="margin-top-4">
            <WithGutter gutter={<Contact />}>
              <Paragraph>
                <strong>Location</strong> determines the demographic data used
                by the model, including population, existing data about the
                spread of Covid-19 in the region, and historical social
                distancing levels.
              </Paragraph>
              <Paragraph>
                The <strong>social distancing scenario</strong> models what the
                people and governments in the region might do in the future—how
                socially distanced will they be, and for how long?
              </Paragraph>
            </WithGutter>
            <ModelInputs width={width} height={height.small} />
            <EffectiveReproductionNumber width={width} height={height.small} />
            <SEIR width={width} height={height.large} />
            <Fitting width={width} height={height.large} />
            <Daily width={width} height={height.large} />
            <Hospitalizations width={width} height={height.large} />
            <ICU width={width} height={height.large} />
            {/* <TestAndTrace width={width} height={height.large} /> */}
            {/* <Symptomatic width={width} height={height.regular} /> */}
            {/* <ProjectedDeaths width={width} height={height.large} /> */}
            <Title className="margin-top-5">
              Model details, references, and outcomes
            </Title>
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
        {/* <FeedbackForm /> */}
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
