import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';

const {useState} = React;

const styles = css`
  button {
    background: ${theme.color.gray[6]};
    border-radius: 999em;
    color: ${theme.color.background};
    cursor: pointer;
    font-weight: 600;
    font-size: ${theme.font.size.small};
    margin-bottom: ${theme.spacing[3]};
    padding: ${theme.spacing[0]} ${theme.spacing[1]};
  }
  .collapsed-content {
    overflow: hidden;
  }
  .collapsed-overlay {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      to bottom,
      rgba(${theme.color.backgroundRgb}, 0%) 0%,
      rgba(${theme.color.backgroundRgb}, 80%) 50%,
      rgba(${theme.color.backgroundRgb}, 100%) 90%
    );
  }
`;

export function Collapsed({
  children,
  label = 'Read more',
  maxHeight = '256px',
}) {
  const [collapsed, setCollapsed] = useState(true);
  const style = collapsed ? {maxHeight} : undefined;
  return (
    <div className="relative">
      <style jsx>{styles}</style>
      <div className="collapsed-content" style={style}>
        {children}
      </div>
      {collapsed && (
        <div className="collapsed-overlay">
          <button onClick={() => setCollapsed(false)}>{label}</button>
        </div>
      )}
    </div>
  );
}
