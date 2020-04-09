import * as React from 'react';
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
  const {
    model: {parameters},
  } = useModelData();
  return (
    <div className="margin-top-5">
      <style jsx>{styles}</style>
      <Title>Parameter table</Title>
      <Paragraph>
        The following parameters are used in the COSMC model:
      </Paragraph>
      <Grid mobile={1} desktop={2}>
        {Object.entries(parameters).map(
          ([id, {name, value, description, type}]) => (
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
                format={(type) => (
                  <span className="text-gray-faint">{type}</span>
                )}
              />
              <div className="margin-top-0">
                <LegendEntry label={description} />
              </div>
              {/* <div className="parameter-type">{type}</div> */}
              {/* <div className="parameter-description">{description}</div> */}
              {/* <td>
                  <div className="weight-600">{id}</div>
                  {name}
                </td>
                <td>{value}</td>
                <td>{description}</td>
                <td className="cell-type">{type}</td> */}
            </LegendRow>
          )
        )}
      </Grid>
    </div>
  );
}
