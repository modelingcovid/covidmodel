import * as React from 'react';
import {useSelect as useSelectDownshift} from 'downshift';
import {useComponentId} from './useComponentId';
import {useComponentMounted} from './useComponentMounted';

const {useEffect, useState} = React;

// A light wrapper around Downshift’s React hooks to fix synchronization.
export const useSelect = ({
  id,
  selectedItem,
  onSelectedItemChange,
  ...remaining
}) => {
  const generatedId = useComponentId('select');

  const result = useSelectDownshift({
    ...remaining,
    id: generatedId || id,
    selectedItem,
    // We can’t pass a method that sets state outside of this method, otherwise
    // React will trigger an update on another component and throw an error.
    // Instead, we track the state internally and broadcast the update when
    // it’s safe using an effect.
    onSelectedItemChange: ({selectedItem}) =>
      setInternalSelectedItem(selectedItem),
  });
  const [internalSelectedItem, setInternalSelectedItem] = useState(
    result.selectedItem
  );

  const mounted = useComponentMounted();
  React.useEffect(() => {
    mounted && onSelectedItemChange({selectedItem: internalSelectedItem});
  }, [mounted, internalSelectedItem, onSelectedItemChange]);

  return result;
};
