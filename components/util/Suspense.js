import * as React from 'react';

export function Suspense(props) {
  if (typeof window === 'undefined') {
    return props.fallback;
  }
  return <React.Suspense {...props} />;
}
