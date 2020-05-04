import * as React from 'react';
import {theme} from '../styles';
import {
  Gutter,
  InlineLabel,
  InlineData,
  Paragraph,
  Title,
  WithCitation,
} from './content';
import {Graph, Line, LegendRow} from './graph';
import {
  CapacityEstimation,
  DistributionLegendRow,
  DistributionLine,
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
  formatFixedDate,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];
const magenta = theme.color.magenta[1];
const gray = theme.color.gray[2];

function ICUCapacity() {
  const {icuCapacity} = useLocationData();
  return <InlineData>{() => formatNumber(icuCapacity.get(0))}</InlineData>;
}

function ICUBeds() {
  const {icuBeds} = useLocationData();
  return <InlineData>{() => formatNumber(icuBeds())}</InlineData>;
}

export const ICU = ({width, height}) => {
  const {location} = useModelState();
  const {
    currentlyCritical,
    currentlyReportedCritical,
    cumulativeCritical,
    cumulativeReportedCritical,
    dateICUOverCapacity,
    domain,
    icuBeds,
    icuCapacity,
  } = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Title>Projecting intensive care unit (ICU) occupancy</Title>
      <Paragraph>
        We also model the expected number of Covid-19 cases that will require
        intensive care. Similar to hospitalizations, we do not fit the model to
        the reported ICU admission data. Instead, we show what the model would
        expect for {location.name}.
      </Paragraph>
      <WithCitation
        citation={[
          <>
            Cities like New York have{' '}
            <a href="https://projects.thecity.nyc/2020_03_covid-19-tracker/">
              significantly increased ICU capacity
            </a>{' '}
            when faced with an influx of cases.
          </>,
          <>
            As more data becomes available in the future, we would like to
            display the reported ICU capacity in {location.name} for additional
            clarity.
          </>,
        ]}
      >
        <Paragraph>
          {location.name} typically has{' '}
          <InlineLabel color={theme.color.gray[4]} fill={gray} glyph="dash">
            <ICUBeds /> total ICU beds
          </InlineLabel>
          . As the number of{' '}
          <InlineLabel color={theme.color.blue.text} fill={blue}>
            patients who currently require intensive care
          </InlineLabel>{' '}
          approaches ICU capacity, {location.name}{' '}
          <span className="footnote">
            can add ICU beds and personnel to care for incoming patients.
          </span>{' '}
          As a result,{' '}
          <span className="footnote">
            the model allows the number of{' '}
            <InlineLabel color={theme.color.yellow.text} fill={yellow}>
              patients currently reported in intensive care
            </InlineLabel>{' '}
            to exceed the typical total number of ICU beds.
          </span>
        </Paragraph>
      </WithCitation>

      <Graph
        domain={domain.critical.currently}
        initialScale="log"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine
              y={currentlyCritical}
              color={blue}
              mode="gradient"
            />
            <DistributionLine y={currentlyReportedCritical} color={yellow} />
            <Line y={icuBeds} stroke={gray} strokeDasharray="6,3" dot={false} />
          </>
        )}
      </Graph>
      <Gutter>
        <LegendRow
          label="Total ICU beds"
          y={icuBeds}
          color={gray}
          format={formatNumber}
          mode="dash"
        />
        <DistributionLegendRow
          title="Currently require intensive care"
          y={currentlyCritical}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently require intensive care"
          y={currentlyReportedCritical}
          color={yellow}
          format={formatNumber}
        />
      </Gutter>
      <Paragraph>
        While we expect that exceeding ICU capacity would have a dramatic effect
        on the fatality rate of Covid-19, the model currently does not adjust
        the fatality rate in this situation.
      </Paragraph>
      <Paragraph>
        Next, we look at an analagous graph for cumulative ICU admissions, which
        is how some states report this statistic.
      </Paragraph>
      <Graph
        domain={domain.critical.cumulative}
        initialScale="log"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine
              y={cumulativeCritical}
              color={blue}
              mode="gradient"
            />
            <DistributionLine y={cumulativeReportedCritical} color={yellow} />
          </>
        )}
      </Graph>
      <Gutter>
        <DistributionLegendRow
          title="Total cases that require intensive care"
          y={cumulativeCritical}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Total reported hospitalized"
          y={cumulativeReportedCritical}
          color={yellow}
          format={formatNumber}
        />
      </Gutter>
    </div>
  );
};
