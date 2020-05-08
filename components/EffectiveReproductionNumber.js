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
import {Graph, Line} from './graph';
import {CalendarDay, Clock, PeopleArrows, Viruses} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
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
    <div className="margin-top-4 flow-root" {...remaining}>
      <Title>How does social distancing relate to how the virus spreads?</Title>
      <Paragraph>
        Epidemiologists measure how quickly a disease spreads through{' '}
        <strong>R₀</strong>, its <strong>basic reproduction number</strong>,
        defined as the number of people a disease will spread to from a single
        infected person. R₀ differs across geographic locations based on
        population demographics and density. The model couples this information
        with confirmed fatality and positive testing data to estimate how
        contagious Covid-19 is in each location. The model estimates that
        Covid-19 had an R₀ of{' '}
        <InlineData>{() => formatNumber2(r0())}</InlineData> in&nbsp;
        {location.name} when the virus first arrived and there were no
        distancing measures in place.
      </Paragraph>
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
        domain={r0}
        initialScale="linear"
        tickFormat={formatNumber2}
        height={height}
        width={width}
        xLabel="R"
        nice={false}
      >
        {() => (
          <DistributionLine
            y={rt}
            color={theme.color.magenta[1]}
            mode="gradient"
          />
        )}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          color={theme.color.magenta[1]}
          title={
            <>
              R<sub>t</sub>
            </>
          }
          y={rt}
          format={formatNumber2}
        />
      </Gutter>
      <Paragraph>
        If the virus spreads through a significant portion of the population, it
        has a decreasing chance of reaching a susceptible person. This also
        contributes to a reduced R<sub>t</sub>.
      </Paragraph>
    </div>
  );
}
