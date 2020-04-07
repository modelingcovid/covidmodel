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

export const Select = React.memo(function Select({
  children,
  label,
  placeholder = '',
  selectedToString,
  valueToString,
  values,
  value,
  onChange,
}) {
  const itemToString = toStringFn(valueToString);

  const selectedItemToString = selectedToString
    ? toStringFn(selectedToString)
    : itemToString;

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

  const icon = (
    <DownArrow
      style={{
        whiteSpace: 'nowrap',
        display: 'inline',
        marginLeft: '2px',
      }}
    />
  );
  let itemText = selectedItemToString(selectedItem) || placeholder;
  if (typeof itemText === 'string') {
    const spaceIndex = itemText.lastIndexOf(' ');
    const before = spaceIndex === -1 ? '' : itemText.slice(0, spaceIndex);
    const after = spaceIndex === -1 ? itemText : itemText.slice(spaceIndex);
    itemText = (
      <>
        {before}
        <span style={{whiteSpace: 'nowrap'}}>
          {after}
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
        label {
          display: block;
        }
        ul {
          z-index: 100;
          position: absolute;
          margin-top: var(--spacing0);
          max-height: 50vh;
          min-width: 180px;
          overflow-y: auto;
          border-top: 0;
          background: var(--color-background);
          transition: opacity 100ms ease-in-out, transform 250ms ease-in-out;
        }
        .closed {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-2px);
        }
        @media (max-width: 400px) {
          ul {
            left: var(--spacing0);
            right: var(--spacing0);
            max-width: 100vw;
          }
        }
      `}</style>
      <div className="focus-within">
        <label {...getLabelProps()} className="text-small text-gray-light">
          {label}
        </label>
        <button
          {...getToggleButtonProps()}
          className="text-ui weight-600 text-gray"
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
