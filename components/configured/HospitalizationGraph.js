import * as React from 'react';
import {theme} from '../../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from '../content';
import {Area, Graph, LegendRow, Line, LinearGradient, Stop} from '../graph';
import {
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  useModelState,
  useLocationData,
} from '../modeling';
import {
  formatShortDate,
  formatDate,
  formatMonths,
  formatNumber,
  formatNumber2,
  formatPercent1,
} from '../../lib/format';
import {getLastDate} from '../../lib/date';

const {useCallback, useMemo} = React;

const blue = theme.color.blue[2];
const red = theme.color.red[1];
const yellow = theme.color.yellow[3];

export const HospitalizationGraph = ({children, ...props}) => {
  const {
    domain,
    hospitalCapacity,
    currentlyHospitalized,
    currentlyReportedHospitalized,
    cumulativeDeaths,
  } = useLocationData();

  return (
    <Graph
      domain={domain.hospitalized.currently}
      initialScale="linear"
      xLabel="people"
      {...props}
    >
      {(context) => {
        const {id, yMax, yScale} = context;
        const yDomain = yScale.domain()[1];
        const gradientId = `${id}-hospitalization-gradient`;
        const clipPathId = `${id}-hospitalization-clip`;
        return (
          <>
            <LinearGradient size={yMax} direction="up" id={gradientId}>
              <stop
                offset={0}
                stopColor={theme.color.blue[2]}
                stopOpacity={0.15}
              />
              <stop
                offset={0.4}
                stopColor={theme.color.blue[1]}
                stopOpacity={0.6}
              />
            </LinearGradient>
            <defs>
              <clipPath id={clipPathId}>
                <Area y0={hospitalCapacity.max} y1={() => yDomain} />
              </clipPath>
            </defs>
            <Area
              clipPath={`url(#${clipPathId})`}
              y0={hospitalCapacity.max}
              y1={currentlyHospitalized.expected.get}
              fill={`url(#${gradientId})`}
            />
            <Line y={currentlyHospitalized.expected.get} stroke={blue} />
            <Line y={hospitalCapacity.max} stroke={theme.color.background} />
            <Line
              y={hospitalCapacity.max}
              stroke={yellow}
              strokeDasharray="6,2"
            />
            <Line
              y={cumulativeDeaths.expected.get}
              stroke={theme.color.background}
              strokeWidth={4}
            />
            <Line y={cumulativeDeaths.expected.get} stroke={red} />
            {children && children(context)}
          </>
        );
      }}
    </Graph>
  );
};

export const HospitalizationGutter = ({width, height}) => {
  const {
    domain,
    hospitalCapacity,
    currentlyHospitalized,
    currentlyReportedHospitalized,
  } = useLocationData();

  return (
    <Gutter>
      <LegendRow
        label="Hospital capacity"
        y={hospitalCapacity.max}
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
    </Gutter>
  );
};
