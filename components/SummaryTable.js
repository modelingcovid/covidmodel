import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../styles';
import {
  Collapsed,
  Grid,
  Heading,
  Title,
  Paragraph,
  createTextComponent,
} from './content';
import {LegendRow, LegendEntry} from './graph';
import {useLocationData} from './modeling';
import {Suspense} from './util';
import {formatPercent2} from '../lib/format';

export const Citation = createTextComponent('cite', 'citation');

const styles = css`
  .parameter-description {
    padding-top: ${theme.spacing[0]};
    color: ${theme.color.gray[3]};
    font-size: ${theme.font.size.micro};
  }
  .parameter-type {
    text-transform: uppercase;
  }
`;

export function SummaryTableContents() {
  const {
    totalInfectedFraction,
    fatalityRate,
    fatalityRateSymptomatic,
    fatalityRatePCR,
    fractionOfSymptomaticHospitalized,
    fractionOfSymptomaticHospitalizedOrICU,
    fractionOfPCRHospitalized,
    fractionOfPCRHospitalizedOrICU,
    fractionHospitalizedInICU,
    fractionOfDeathInICU,
    fractionDeathOfHospitalizedOrICU,
    fractionOfInfectionsPCRConfirmed,
    fractionOfDeathsReported,
    fractionOfHospitalizationsReported,
  } = useLocationData();

  const metrics = [
    {
      id: 'fatalityRate',
      name: 'Fatality Rate',
      value: fatalityRate(),
      description: 'fatality rate of all Covid-19 cases',
      citations: [],
    },
    {
      id: 'fatalityRateSymptomatic',
      name: 'Fatality Rate Symp',
      value: fatalityRateSymptomatic(),
      description: 'Fatality rate of all symptomatic Covid-19 cases',
      citations: [],
    },
    {
      id: 'fatalityRatePCR',
      name: 'Fatality Rate PCR',
      value: fatalityRatePCR(),
      description: 'Fatality rate of all PCR confirmed Covid-19 cases',
      citations: [],
    },
    {
      id: 'fractionOfSymptomaticHospitalized',
      name: 'Fraction of symptomatic hospitalized',
      value: fractionOfSymptomaticHospitalized(),
      description:
        'The fraction of all symptomatic Covid-19 cases that require hospitalization, but not critical care.',
      citations: [],
    },
    {
      id: 'fractionOfSymptomaticHospitalizedOrICU',
      name: 'Fraction of symptomatic hospitalized or critical',
      value: fractionOfSymptomaticHospitalizedOrICU(),
      description:
        'The fraction of all symptomatic Covid-19 cases that require hospitalization or critical care.',
      citations: [],
    },
    {
      id: 'fractionOfPCRHospitalized',
      name: 'Fraction of PCR confirmed cases hospitalized',
      value: fractionOfPCRHospitalized(),
      description:
        'The fraction of all PCR confirmed Covid-19 cases that require hospitalization.',
      citations: [],
    },
    {
      id: 'fractionOfPCRHospitalizedOrICU',
      name: 'Fraction of PCR confirmed cases hospitalized or critical',
      value: fractionOfPCRHospitalizedOrICU(),
      description:
        'The fraction of all PCR confirmed Covid-19 cases that require hospitalization or intensive care.',
      citations: [
        'https://arxiv.org/pdf/2003.09320.pdf',
        'https://coronavirus.ohio.gov/static/CovidSummaryData.csv',
      ],
    },
    {
      id: 'fractionHospitalizedInICU',
      name: 'Fraction of hospitalized in ICU',
      value: fractionHospitalizedInICU(),
      description:
        'The fraction of all patients requiring critical care or hospitalization that are hospitalized',
      citations: [
        'https://jamanetwork.com/journals/jama/fullarticle/2765184',
        'https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf',
      ],
    },
    {
      id: 'fractionOfDeathInICU',
      name: 'Fraction of deaths for critical patients',
      value: fractionOfDeathInICU(),
      description:
        'The fraction of all critical cases that result in a fatality',
      citations: [
        'https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf',
      ],
    },
    {
      id: 'fractionDeathOfHospitalizedOrICU',
      name: 'Fraction of deaths for hospitalized or critical patients',
      value: fractionDeathOfHospitalizedOrICU(),
      description:
        'The fraction of all hospitalized and critical cases that result in a fatality',
      citations: [
        'https://eurosurveillance.org/content/10.2807/1560-7917.ES.2020.25.3.2000044',
        'https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf',
        'https://jamanetwork.com/journals/jama/fullarticle/2765184',
        'https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf',
      ],
    },
    {
      id: 'fractionOfInfectionsPCRConfirmed',
      name: 'Fraction all infections that are PCR confirmed',
      value: fractionOfInfectionsPCRConfirmed(),
      description:
        'The fraction of all infections that eventually get PCR confirmed',
      citations: [],
    },
    {
      id: 'totalInfectedFraction',
      name: 'Total infected fraction',
      value: totalInfectedFraction(),
      description: 'Fraction of population infected',
      citations: [],
    },
    {
      id: 'fractionOfDeathsReported',
      name: 'Total fraction of deaths reported',
      value: fractionOfDeathsReported(),
      description: 'Fraction of deaths that eventually are reported',
      citations: [],
    },
    {
      id: 'fractionOfHospitalizationsReported',
      name: 'Total fraction of hospitalizations reported',
      value: fractionOfHospitalizationsReported(),
      description: 'Fraction of hospitalizations that eventually are reported',
      citations: [],
    },
  ];

  return (
    <div className="margin-top-5 flow-root">
      <style jsx>{styles}</style>
      <Heading>Summary table</Heading>
      <Paragraph>
        The following is a summary of the MC19 model output after two years:
      </Paragraph>
      <Collapsed label="Show summary">
        <Grid mobile={1} desktop={2}>
          {metrics.map(({id, name, value, description, citations}) => (
            <LegendRow
              key={id}
              label={<span className="text-mono ellipsis">{id}</span>}
              y={() => formatPercent2(value)}
              width="80%"
              format={null}
            >
              <LegendEntry
                label={<span className="text-gray">{name}</span>}
                y={() => citations}
                format={(citations) => (
                  <span
                    className="text-gray-faint"
                    style={{display: 'inline-flex'}}
                  >
                    {citations && citations.length > 0 && (
                      <cite className="parameter-citation">
                        {`[`}
                        {(citations || []).map((href, i) => (
                          <React.Fragment key={i}>
                            <a href={href} target="__blank">
                              {i + 1}
                            </a>
                            {i < citations.length - 1 ? `, ` : ''}
                          </React.Fragment>
                        ))}
                        {`]`}
                      </cite>
                    )}
                  </span>
                )}
              />
              <div className="margin-top-0">
                <LegendEntry label={description} />
              </div>
            </LegendRow>
          ))}
        </Grid>
      </Collapsed>
    </div>
  );
}

export function SummaryTable() {
  return (
    <Suspense fallback={<div />}>
      <SummaryTableContents />
    </Suspense>
  );
}
