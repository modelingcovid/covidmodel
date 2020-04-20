import * as React from 'react';
import Link from 'next/link';
import {theme} from '../styles';
import {DistancingGraph} from './configured';
import {
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Instruction,
  Paragraph,
  Title,
  WithCitation,
} from './content';
import {Graph, LegendRow, Line} from './graph';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  Estimation,
  useFindPoint,
  useModelState,
  useLocationData,
  useTodayDistancing,
} from './modeling';
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

function TodayDistancing() {
  const todayDistancing = useTodayDistancing();
  return (
    <InlineData width="2em">
      {() => formatPercent(1 - todayDistancing())}
    </InlineData>
  );
}

const formatDistancing = (n) => formatPercent(1 - n);

export function EffectiveReproductionNumber({height, width, ...remaining}) {
  const {location} = useModelState();
  const {r0, importtime, distancing, rt} = useLocationData();

  const formatR = useCallback((n) => formatNumber2(n * r0()), [r0]);

  return (
    <div className="margin-top-3 flow-root" {...remaining}>
      <Title>How does social distancing relate to how the virus spreads?</Title>
      <Paragraph>
        Epidemiologists measure how quickly a disease spreads through{' '}
        <strong>R₀</strong>, its <strong>basic reproduction number</strong>,
        defined as the number of people a disease will spread to from a single
        infected person. R₀ differs across geographic locations based on
        population demographics and density. The model couples this information
        with confirmed fatality and positive testing data to estimate how
        contagious COVID-19 is in each location.
      </Paragraph>
      <Estimation status={false}>
        The model estimates that COVID-19 has an R₀ of{' '}
        <InlineData>{() => formatNumber2(r0())}</InlineData> in {location.name}{' '}
        when there is no social distancing.
      </Estimation>
      <Paragraph>
        When social distancing measures are introduced, it becomes more
        difficult for a disease to spread through a population. We represent
        this using
        <InlineLabel
          color={theme.color.magenta[1]}
          fill={theme.color.magenta[1]}
        >
          R<sub>t</sub>
        </InlineLabel>
        , the <strong>effective reproduction number</strong>. R<sub>t</sub>{' '}
        represents how many people a single case of the disease will spread to
        at a given point in time, taking social distancing measures into
        account.
      </Paragraph>
      <Graph
        initialScale="linear"
        tickFormat={formatR}
        height={height}
        width={width}
        xLabel="R"
        nice={false}
      >
        {() => <Line y={rt} stroke={theme.color.magenta[1]} />}
      </Graph>
      <Gutter>
        <LegendRow
          color={theme.color.magenta[1]}
          label={
            <>
              R<sub>t</sub>
            </>
          }
          y={rt}
          format={formatR}
        />
      </Gutter>
    </div>
  );
}
