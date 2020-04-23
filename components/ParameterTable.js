import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../styles';
import {Grid, Title, Paragraph, createTextComponent} from './content';
import {LegendRow, LegendEntry} from './graph';
import {useLocationData} from './modeling';
import {Suspense} from './util';
import {formatNumber2Nice} from '../lib/format';

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

export function ParameterTableContents() {
  const {parameters} = useLocationData();

  return (
    <div className="margin-top-3 flow-root">
      <style jsx>{styles}</style>
      <Title>Parameter table</Title>
      <Paragraph>
        The following parameters are used in the COSMC model:
      </Paragraph>
      <Grid mobile={1} desktop={2}>
        {parameters().map(({id, name, value, description, type, citations}) => (
          <LegendRow
            key={id}
            label={<span className="text-mono ellipsis">{id}</span>}
            y={() => formatNumber2Nice(value)}
            width="80%"
            format={null}
          >
            <LegendEntry
              label={<span className="text-gray">{name}</span>}
              y={() => type}
              format={(type) => (
                <span
                  className="text-gray-faint"
                  style={{display: 'inline-flex'}}
                >
                  {type}
                  {citations && citations.length > 0 && (
                    <cite className="parameter-citation">
                      {`[`}
                      {(citations || []).map((href, i) => (
                        <>
                          <a href={href} target="__blank">
                            {i + 1}
                          </a>
                          {i < citations.length - 1 ? `, ` : ''}
                        </>
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
    </div>
  );
}

export function ParameterTable() {
  return (
    <Suspense fallback={<div />}>
      <ParameterTableContents />
    </Suspense>
  );
}
