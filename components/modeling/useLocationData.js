import {useModelState} from './useModelState';
import {fetchLocationData} from '../query';

export function useLocationData() {
  const {location, scenario} = useModelState();
  return fetchLocationData(location.id, scenario.id);
}
