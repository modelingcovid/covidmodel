import * as React from 'react';
import classNames from 'classnames';
import {DownArrow} from './icon';
import {useSelect} from './util';
import {theme} from '../styles';

const {useEffect, useState} = React;

const toStringFn = (fnOrObj) => {
  return typeof fnOrObj === 'function'
    ? fnOrObj
    : (v) => (fnOrObj ? fnOrObj[v] : v);
};

export const Menu = React.memo(function Menu({
  children,
  menuProps,
  valueToString,
  values,
  value,
  onChange,
}) {
  const itemToString = toStringFn(valueToString);
  const items = values;

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items,
    itemToString,
    selectedItem: value || null,
    onSelectedItemChange: ({selectedItem}) => onChange(selectedItem),
  });

  return (
    <div>
      <style jsx>{`
        button {
          font-family: inherit;
          font-weight: inherit;
          font-style: inherit;
          text-align: left;
          outline: none;
          padding: 4px;
          margin: -4px;
        }
        ul {
          z-index: 100;
          position: absolute;
          margin-top: ${theme.spacing[0]};
          max-height: 50vh;
          min-width: 180px;
          overflow-y: auto;
          border-top: 0;
          background: ${theme.color.background};
          transition: opacity 100ms ease-in-out, transform 250ms ease-in-out;
          box-shadow: 0 0 0 1px ${theme.color.shadow[0]};
          border-radius: 2px;
        }
        .closed {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-2px);
        }
        @media (max-width: 400px) {
          ul {
            left: ${theme.spacing[0]};
            right: ${theme.spacing[0]};
            max-width: 100vw;
          }
        }
      `}</style>
      <button className="focus" {...getToggleButtonProps()}>
        {children}
      </button>
      <ul
        {...getMenuProps(menuProps)}
        className={classNames('focus text-small', {closed: !isOpen})}
      >
        {isOpen &&
          items.map((item, index) => {
            const isHighlighted = highlightedIndex === index;
            const isSelected = selectedItem === item;
            const style = {
              padding: 'var(--spacing0)',
              fontWeight: isSelected ? 500 : 400,
              background: isHighlighted ? 'var(--color-gray-bg)' : '',
              boxShadow: isHighlighted
                ? 'inset 0 1px var(--color-gray0), inset 0 -1px var(--color-gray0)'
                : '',
            };
            return (
              <li
                className="text-gray-dark no-select"
                style={style}
                key={`${item}${index}`}
                {...getItemProps({item, index})}
              >
                {itemToString(item)}
              </li>
            );
          })}
      </ul>
    </div>
  );
});
