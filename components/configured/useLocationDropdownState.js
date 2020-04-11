import {useMemo} from 'react';
import {useLocations} from '../modeling';

export function useLocationDropdownState() {
  const [locations] = useLocations();
  const ids = useMemo(() => locations.map(({id}) => id), [locations]);
  const nameMap = useMemo(
    () =>
      locations.reduce((o, {id, name}) => {
        o[id] = name;
        return o;
      }, {}),
    [locations]
  );
  return [ids, nameMap];
}
