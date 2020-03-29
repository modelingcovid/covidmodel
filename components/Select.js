import * as React from 'react';

const DownArrow = ({size = 16, ...props}) => (
  <svg
    {...props}
    height={size}
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
  >
    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
  </svg>
);

const identity = (x) => x;

export const Select = ({
  children = identity,
  label,
  onChange,
  value,
  values,
}) => {
  const currentValue = value ?? values[0];
  const toLabel =
    typeof label === 'function' ? label : (v) => (label ? label[v] : v);
  return (
    <div className="select focus-within">
      <style jsx>{`
        .select {
          position: relative;
          display: inline-flex;
        }
        .content {
          min-height: 1em;
          pointer-events: none;
          display: inline-flex;
          align-items: baseline;
        }
        select {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div className="content text-title">
        <span>{children(toLabel(currentValue))}</span>
        <DownArrow fill="var(--color-gray-02)" style={{flexShrink: 0}} />
      </div>
      <select value={value} onChange={onChange}>
        {values.map((v, i) => (
          <option key={i} value={v}>
            {toLabel(v)}
          </option>
        ))}
      </select>
    </div>
  );
};
