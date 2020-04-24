import * as React from 'react';
import {theme} from '../../styles';
import {Grid, Gutter, InlineLabel, Paragraph, Title} from '../content';
import {Area, Graph, LegendRow, Line, LinearGradient, Stop} from '../graph';
import {
  ContainmentSplit,
  DistributionLegendRow,
  DistributionLine,
  Estimation,
  useExpected,
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

export function HospitalizationGraphContents({clipPathId, gradientId}) {
  const {
    hospitalCapacity,
    currentlyHospitalized,
    currentlyReportedHospitalized,
    cumulativeDeaths,
  } = useLocationData();
  const expected = useExpected();
  return (
    <>
      <Area
        clipPath={`url(#${clipPathId})`}
        y0={hospitalCapacity.max}
        y1={expected(currentlyHospitalized).get}
        fill={`url(#${gradientId})`}
      />
      <Line y={expected(currentlyHospitalized).get} stroke={blue} />
      <Line y={hospitalCapacity.max} stroke={theme.color.background} />
      <Line y={hospitalCapacity.max} stroke={yellow} strokeDasharray="6,2" />
      <Line
        y={expected(cumulativeDeaths).get}
        stroke={theme.color.background}
        strokeWidth={4}
      />
      <Line y={expected(cumulativeDeaths).get} stroke={red} />
    </>
  );
}

export function HospitalizationGraph({children, ...props}) {
  const {domain, hospitalCapacity} = useLocationData();

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
            <ContainmentSplit>
              <HospitalizationGraphContents
                clipPathId={clipPathId}
                gradientId={gradientId}
              />
            </ContainmentSplit>
          </>
        );
      }}
    </Graph>
  );
}

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
