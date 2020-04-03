import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';

const styles = css`
  .definition {
    display: flex;
    flex-direction: column;
    font-size: ${theme.font.size.small};
    line-height: 1.4;
  }
  .definition-value {
    font-family: ${theme.font.family.mono};
    font-weight: 500;
    padding-right: ${theme.spacing[0]};
  }
  @media (min-width: 600px) {
    .definition {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
`;

const getValueClass = (method) => {
  switch (method) {
    case 'modeled':
      return 'highlight';
    case 'fit':
      return 'highlight-purple';
    case 'input':
    default:
      return '';
  }
};

export const Definition = ({icon: Icon, value, label, method}) => {
  const valueClasses = [];

  return (
    <div className="definition text-gray">
      <style jsx>{styles}</style>

      <div className="definition-value">
        {Icon && (
          <Icon
            className="text-gray-faint"
            size={20}
            style={{flexShrink: 0, marginRight: theme.spacing[0]}}
          />
        )}
        <span className={getValueClass(method)}>{value}</span>
      </div>
      {label && <div className="text-gray-light">{label}</div>}
    </div>
  );
};
