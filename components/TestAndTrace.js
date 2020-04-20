import * as React from 'react';
import {theme} from '../styles';
import {
  Grid,
  Heading,
  InlineLabel,
  ListItem,
  Paragraph,
  Title,
  OrderedList,
  WithCitation,
} from './content';
import {Graph} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  useLocationData,
  useModelState,
} from './modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

export const TestAndTrace = ({width, height}) => {
  const {location, indices, x} = useModelState();
  const {dailyDeath, newlyExposed, dailyPcr, domain} = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Title>Containment strategies for COVID-19</Title>
      <Paragraph>
        Social distancing slows the spread of the virus through the population,
        but doesn’t contain it.
      </Paragraph>
      <OrderedList>
        <ListItem>
          {/* https://www.nytimes.com/2020/04/13/opinion/coronavirus-immunity.html */}
          <strong>Herd immunity:</strong> A population develops “
          <a
            href="https://apic.org/monthly_alerts/herd-immunity/"
            rel="noopener noreferrer"
            target="_blank"
          >
            herd immunity
          </a>
          ” when enough members have built up immunity to a disease through
          either infection or vaccination, at which point the disease can no
          longer spread through the population.
        </ListItem>
        <ListItem>
          <strong>Test and trace:</strong> This approach attempts to contain the
          virus by diligently tracking the spread of the virus and quarantining
          infected people. When a person tests positive,
        </ListItem>
      </OrderedList>
      <Heading>How many tests do we need to run to trace the virus?</Heading>
      <Paragraph>
        Testing the population is only viable if we can test
      </Paragraph>
      <Paragraph>
        The following graph compares
        <InlineLabel
          color={theme.color.yellow.text}
          fill={theme.color.yellow[3]}
        >
          new infections per day
        </InlineLabel>
        ,
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[2]}>
          positive tests per day
        </InlineLabel>
        , along with their respective confirmed data points:
      </Paragraph>
      <Graph
        data={indices}
        domain={domain.newlyExposed}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine
              y={newlyExposed}
              color={theme.color.yellow[3]}
              gradient
            />
            <DistributionLine
              y={dailyPcr}
              color={theme.color.blue[2]}
              gradient
            />
          </>
        )}
      </Graph>
      <Grid>
        <DistributionLegendRow
          title="New infections per day"
          y={newlyExposed}
          color={theme.color.yellow[3]}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Positive tests per day"
          y={dailyPcr}
          color={theme.color.blue[2]}
          format={formatNumber}
        />
      </Grid>
    </div>
  );
};
