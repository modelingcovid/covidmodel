import * as React from 'react';
import {theme} from '../styles';
import {
  Grid,
  Gutter,
  Heading,
  InlineData,
  InlineLabel,
  Instruction,
  Paragraph,
  Title,
  OrderedList,
  UnorderedList,
  WithCitation,
} from './content';
import {useNearestData} from './graph';
import {Estimation, useLocationData, useModelState} from './modeling';
import {formatPercent, formatPercent1} from '../lib/format';

const {useState} = React;

function FatalityRate({asymptomaticRate}) {
  const nearest = useNearestData();
  const {cumulativeDeaths, cumulativeRecoveries} = useLocationData();

  return (
    <InlineData>
      {() => {
        const deaths = cumulativeDeaths.expected.get(nearest());
        const recoveries = cumulativeRecoveries.expected.get(nearest());
        const cohort = (deaths + recoveries) * (1 - asymptomaticRate);
        const rate = cohort ? deaths / cohort : 0;
        return formatPercent1(rate);
      }}
    </InlineData>
  );
}

export function Symptomatic({height, width}) {
  const {location, x} = useModelState();

  const defaultAsymptomaticRate = 0.3;
  const [asymptomaticRate, setAsymptomaticRate] = useState(
    defaultAsymptomaticRate
  );

  return (
    <div className="margin-top-3 flow-root">
      <Heading>Determining symptomatic statistics</Heading>
      <WithCitation
        citation={
          <>
            Observed as 32% on the{' '}
            <a href="https://www.medrxiv.org/content/10.1101/2020.03.18.20038125v1.full.pdf">
              Diamond Princess
            </a>
            , 31% for{' '}
            <a href="https://www.ijidonline.com/article/S1201-9712(20)30139-9/pdf">
              Japanese citizens evacuated from Wuhan
            </a>
            , 29% in{' '}
            <a href="https://link.springer.com/content/pdf/10.1007/s11427-020-1661-4.pdf">
              China
            </a>
            , and 34% in{' '}
            <a href="https://www.medrxiv.org/content/10.1101/2020.03.26.20044446v1.full.pdf">
              Iceland
            </a>
            .
          </>
        }
      >
        <Paragraph>
          While the rate of asymptomatic cases of COVID-19 don’t influence the
          results of the COSMC model, they’re useful for generating statistics
          to compare with other models.{' '}
          <span className="footnote">
            By default, we set the <strong>asymptomatic rate</strong> to{' '}
            <strong>{formatPercent(defaultAsymptomaticRate)}</strong>.
          </span>
        </Paragraph>
        <Estimation>
          Based on an asymptomatic rate of {formatPercent(asymptomaticRate)},
          the model projects the fatality rate of symptomatic COVID-19 cases to
          be{' '}
          <strong>
            <FatalityRate asymptomaticRate={asymptomaticRate} />
          </strong>
          .
        </Estimation>
      </WithCitation>
    </div>
  );
}
