import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';
import {Label} from './Label';

const styles = css`
  .definition-before {
    font-size: ${theme.font.size.micro};
    padding-bottom: 4px;
  }
  .definition {
    display: flex;
    flex-direction: column;
    font-size: ${theme.font.size.small};
    line-height: 1.4;
  }
  .definition-value {
    font-family: ${theme.font.family.mono};
    font-weight: 500;
    margin-top: 1px;
    padding-right: ${theme.spacing[0]};
  }
  @media (min-width: 600px) {
    .definition {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
`;

export const Definition = ({icon: Icon, value, label, before}) => {
  const valueClasses = [];

  return (
    <div className="text-gray">
      <style jsx>{styles}</style>

      {before && <div className="definition-before">{before}</div>}
      <div className="definition">
        <div className="definition-value">
          {Icon && (
            <Icon
              className="text-gray-faint"
              size={20}
              style={{flexShrink: 0, marginRight: theme.spacing[0]}}
            />
          )}
          <span>{value}</span>
        </div>
        {label && <div className="text-gray-light">{label}</div>}
      </div>
    </div>
  );
};
