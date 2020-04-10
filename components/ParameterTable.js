import * as React from 'react';
import useSWR from 'swr';
import css from 'styled-jsx/css';
import {theme} from '../styles';
import {Grid, Title, Paragraph} from './content';
import {LegendRow, LegendEntry} from './graph';
import {useModelData} from './modeling';

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

export function ParameterTable() {
  const {state} = useModelData();

  const {data, error} = useSWR(
    `{ location(id: "${state}") { parameters {
      id, name, value, description, type
    } } }`
  );

  console.log('Fetched parameter data', data, error);

  if (error) return null;
  if (!data) return null;

  return null;
  const {
    location: {parameters},
  } = data;

  return (
    <div className="margin-top-5">
      <style jsx>{styles}</style>
      <Title>Parameter table</Title>
      <Paragraph>
        The following parameters are used in the COSMC model:
      </Paragraph>
      <Grid mobile={1} desktop={2}>
        {parameters.map(({id, name, value, description, type}) => (
          <LegendRow
            key={id}
            label={<span className="text-mono ellipsis">{id}</span>}
            y={() => value}
            width="80%"
            format={null}
          >
            <LegendEntry
              label={<span className="text-gray">{name}</span>}
              y={() => type}
              format={(type) => <span className="text-gray-faint">{type}</span>}
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
