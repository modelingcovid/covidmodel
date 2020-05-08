import * as React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import {theme} from '../styles';
import {Contact, DistancingGraph, formatDistancing} from './configured';
import {
  Block,
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Instruction,
  Paragraph,
  WithCitation,
  WithGutter,
} from './content';
import {Graph, LegendRow, Line} from './graph';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  Estimation,
  DistributionLegendRow,
  DistributionLine,
  useFindPoint,
  useModelState,
  useLocationData,
  useTodayDistancing,
} from './modeling';
import {Suspense} from './util';
import {getScenarioLabel} from '../lib/controls';
import {dayToDate, daysToMonths, today} from '../lib/date';
import {
  formatDate,
  formatShortDate,
  formatNumber,
  formatNumber2,
  formatPercent,
  formatPercent2,
} from '../lib/format';

const {useCallback, useMemo} = React;

const scenarioCount = 8;
const scenarioHeight = 72;

const styles = css`
  a {
    cursor: pointer;
  }
  .scenario-item {
    padding: ${theme.spacing[0]} 0;
    box-shadow: 0 -1px ${theme.color.shadow[0]};
    height: ${scenarioHeight}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: ${theme.font.size.small};
  }
  .scenario-status {
    margin-top: 4px;
  }
  .scenario-badge {
    display: inline-block;
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.tiny};
    font-weight: 400;
    padding: 2px;
    background: ${theme.color.gray.bg};
    color: ${theme.color.gray[3]};
  }
`;

function ScenarioItem({currentDistancingLevel, scenario, setScenario}) {
  const id = scenario.id;
  const onClick = useCallback(() => setScenario(id), [id]);
  return (
    <div className="scenario-item">
      <style jsx>{styles}</style>
      <Block className="clamp-2">
        <a role="button" onClick={onClick}>
          {getScenarioLabel(scenario, currentDistancingLevel)}
        </a>
      </Block>
      <div className="scenario-status">
        <span className="scenario-badge">
          {scenario.dateContained ? 'Test and trace' : 'Second wave'}
        </span>
      </div>
    </div>
  );
}

export function ScenariosList() {
  const {scenarioData, setScenario} = useModelState();
  const {scenarios} = useLocationData();

  const currentScenario = useMemo(
    () => scenarios().find(({name}) => name === 'Current'),
    [scenarios]
  );
  const currentDistancingLevel = currentScenario.distancingLevel;

  return (
    <>
      {scenarios().map((scenario) => (
        <ScenarioItem
          key={scenario.id}
          currentDistancingLevel={currentDistancingLevel}
          scenario={scenario}
          setScenario={setScenario}
        />
      ))}
    </>
  );
}

export function Scenarios({height, width, ...remaining}) {
  const {location} = useModelState();

  return (
    <div className="flow-root" {...remaining}>
      <WithGutter gutter={<Contact />}>
        <Paragraph>
          <strong>Location</strong> determines the demographic data used by the
          model, including population, existing data about the spread of
          Covid-19 in the region, and historical social distancing levels.
        </Paragraph>
        <Paragraph>
          The <strong>social distancing scenario</strong> models what the people
          and governments in the region might do in the future—how socially
          distanced will they be, and for how long?
        </Paragraph>
      </WithGutter>
      <WithCitation
        citation={
          <>
            These options are themselves a simplification, and each involve only
            one distancing period. In practice, distancing is complex, and will
            vary over time. We hope to model more complex distancing scenarios
            based on real world proposals and data in the future.
          </>
        }
      >
        <Paragraph>
          Instead of selecting a single scenario, our model provides{' '}
          <span className="footnote">several potential options</span> for social
          distancing. Many scenarios illustrate what happens when distancing
          measures are stopped entirely: a <strong>second wave</strong> of
          cases. Several scenarios suppress the virus enough for a robust “
          <strong>test and trace</strong>” strategy to become feasible. We model
          these options to show how our policies and collective actions could
          impact the overall spread of the virus.
        </Paragraph>
      </WithCitation>
      <Heading>Available scenarios for {location.name}</Heading>
      <Suspense
        fallback={
          <div style={{height: `${scenarioCount * scenarioHeight}px`}} />
        }
      >
        <ScenariosList />
      </Suspense>
    </div>
  );
}
