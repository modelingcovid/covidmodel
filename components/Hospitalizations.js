import * as React from 'react';
import {theme} from '../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from './content';
import {Graph, Line} from './graph';
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
  formatPercent1,
} from '../lib/format';
import {getLastDate} from '../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];

export const Hospitalizations = ({width, height}) => {
  const {location, indices, x} = useModelState();
  const {
    domain,
    hospitalCapacity,
    currentlyHospitalized,
    currentlyReportedHospitalized,
    cumulativeHospitalized,
    cumulativeReportedHospitalized,
  } = useLocationData();

  return (
    <div className="margin-top-5">
      <Title>Hospitalizations</Title>
      <Paragraph>
        We estimate the hospital capacity for COVID-19 patients by taking the
        number of available beds and discounting for that hospital system’s
        typical occupancy rate.
      </Paragraph>
      <Graph
        data={indices}
        domain={domain.hospitalized.currently}
        initialScale="log"
        x={x}
        xLabel="people"
        width={width}
        height={height}
        controls
      >
        {() => (
          <>
            <Line y={hospitalCapacity} stroke={red} strokeDasharray="6,3" />
            <DistributionLine y={currentlyHospitalized} color={blue} />
            <DistributionLine
              y={currentlyReportedHospitalized}
              color={yellow}
            />
          </>
        )}
      </Graph>
      <Gutter>
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
      </Gutter>
      <Graph
        data={indices}
        domain={domain.hospitalized.cumulative}
        initialScale="log"
        x={x}
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
      <Gutter>
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
      </Gutter>
    </div>
  );
};
