import * as React from 'react';
import {theme} from '../styles';
import {
  Grid,
  InlineLabel,
  Instruction,
  InlineData,
  Paragraph,
  Title,
} from './content';
import {Graph, LegendRow, Line, useNearestData} from './graph';
import {HeadSideCough, People, Vial} from './icon';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  useModelState,
  useLocationData,
} from './modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatFixedDate,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];

function HospitalCapacityExcedDate() {
  const {dateHospitalsOverCapacity} = useLocationData();
  return (
    <InlineData>
      {() => formatFixedDate(new Date(dateHospitalsOverCapacity()))}
    </InlineData>
  );
}

export const Hospitalizations = ({width, height}) => {
  const {location} = useModelState();
  const {
    domain,
    hospitalCapacity,
    currentlyHospitalized,
    currentlyReportedHospitalized,
    cumulativeHospitalized,
    cumulativeReportedHospitalized,
  } = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <Title>Hospitalizations</Title>
      <Paragraph>
        The following charts show our projections of hospitalizations due to
        Covid-19. Unlike the fatality and confirmed case data, we do not fit the
        model specifically to hospitalization data. Rather, we simply show where
        we expect the occupancy to fall. Therefore some states with much faster
        or slower than average reporting may appear correspondingly ahead or
        behind our curves. Further, we estimate the hospital capacity for
        Covid-19 patients by taking the number of available beds and discounting
        for that hospital system’s typical occupancy rate. Note that these
        hospitalization estimates do not include patients who are admitted to
        the intensive care unit, that is modeled separately below.
      </Paragraph>
      <Graph
        domain={domain.hospitalized.currently}
        initialScale="log"
        xLabel="people"
        width={width}
        height={256}
        controls
      >
        {() => (
          <>
            <DistributionLine y={currentlyHospitalized} color={blue} />
            <DistributionLine
              y={currentlyReportedHospitalized}
              color={yellow}
            />
            <Line y={hospitalCapacity.get} stroke={red} strokeDasharray="6,3" />
          </>
        )}
      </Graph>
      <Grid>
        <LegendRow
          label="Hospital capacity"
          y={hospitalCapacity.get}
          color={red}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently hospitalized"
          y={currentlyHospitalized}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Currently reported hospitalized"
          y={currentlyReportedHospitalized}
          color={yellow}
          format={formatNumber}
        />
      </Grid>
      <Paragraph>
        The graph shows projections for
        <InlineLabel color={theme.color.blue.text} fill={theme.color.blue[3]}>
          patients requiring hospitalization
        </InlineLabel>
        , and
        <InlineLabel
          color={theme.color.yellow.text}
          fill={theme.color.yellow[2]}
        >
          patients currently reported hospitalized
        </InlineLabel>
        . The distinction being that the number reported hospitalized is delayed
        somewhat from the actual number of infections severe enough to require
        hospitalization and we don't expect the number reported to ever exceed
        the hospital capacity.
      </Paragraph>
      <Estimation>
        The model estimates that hospitals in {location.name} will exceed
        capacity on <HospitalCapacityExcedDate />.
      </Estimation>
      <Paragraph>
        Next, we look at an analagous graph for cumulative hospitalizations,
        which is how some states report this statistic.
      </Paragraph>
      <Graph
        domain={domain.hospitalized.cumulative}
        initialScale="log"
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <DistributionLine y={cumulativeHospitalized} color={blue} />
            <DistributionLine
              y={cumulativeReportedHospitalized}
              color={yellow}
            />
          </>
        )}
      </Graph>
      <Grid>
        <DistributionLegendRow
          title="Total hospitalized"
          y={cumulativeHospitalized}
          color={blue}
          format={formatNumber}
        />
        <DistributionLegendRow
          title="Total reported hospitalized"
          y={cumulativeReportedHospitalized}
          color={yellow}
          format={formatNumber}
        />
      </Grid>
      <Instruction>
        <strong>Reading the graph:</strong> This graph shows cumulative
        hospitalizations as a result of Covid-19, as some states report only
        cumulative numbers.
      </Instruction>
    </div>
  );
};
