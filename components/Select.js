import * as React from 'react';
import classNames from 'classnames';
import {DownArrow} from './icon';
import {useSelect} from './util';

const {useEffect, useState} = React;

export const Select = ({
  label,
  placeholder = '',
  valueToString,
  values,
  value,
  onChange,
}) => {
  const currentValue = value ?? values[0];
  const itemToString =
    typeof valueToString === 'function'
      ? valueToString
      : (v) => (valueToString ? valueToString[v] : v);

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
    selectedItem: value,
    onSelectedItemChange: ({selectedItem}) => onChange(selectedItem),
  });

  const icon = (
    <DownArrow
      style={{
        whiteSpace: 'nowrap',
        display: 'inline',
        marginTop: '-2px',
        marginLeft: '2px',
      }}
    />
  );
  let itemText = itemToString(selectedItem) || placeholder;
  if (typeof itemText === 'string') {
    const spaceIndex = itemText.lastIndexOf(' ');
    itemText = (
      <>
        {itemText.slice(0, spaceIndex)}
        <span style={{whiteSpace: 'nowrap'}}>
          {itemText.slice(spaceIndex)}
          {icon}
        </span>
      </>
    );
  } else {
    itemText = (
      <>
        {itemText}
        {icon}
      </>
    );
  }

  return (
    <div>
      <style jsx>{`
        button {
          text-align: left;
          line-height: 1.4;
          outline: none;
        }
        .focus-within {
          padding: 4px;
          margin: -4px;
        }
        ul {
          position: absolute;
          margin-top: var(--spacing-00);
          max-height: 80vh;
          overflow-y: auto;
          border-top: 0;
          background: white;
          transition: opacity 100ms ease-in-out, transform 250ms ease-in-out;
        }
        .closed {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-2px);
        }
        @media (max-width: 400px) {
          ul {
            left: var(--spacing-00);
            right: var(--spacing-00);
            max-width: 100vw;
          }
        }
      `}</style>
      <div className="focus-within">
        <label
          {...getLabelProps()}
          className="text-small text-gray-light block"
        >
          {label}
        </label>
        <button
          {...getToggleButtonProps()}
          className="text-ui weight-600 text-gray text-medium"
        >
          {itemText}
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className={classNames('focus text-small', {closed: !isOpen})}
      >
        {isOpen &&
          items.map((item, index) => {
            const isHighlighted = highlightedIndex === index;
            const style = {
              padding: 'var(--spacing-00)',
              background: isHighlighted ? 'var(--color-gray-bg)' : '',
              boxShadow: isHighlighted
                ? 'inset 0 1px var(--color-gray-00), inset 0 -1px var(--color-gray-00)'
                : '',
            };
            return (
              <li
                className={isHighlighted ? 'text-gray-dark' : 'text-gray-dark'}
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
};
