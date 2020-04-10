import useSWR from 'swr';
import {useModelData} from './useModelData';

export function useLocationQuery(query) {
  const {state} = useModelData();
  const {data, error} = useSWR(`{ location(id: "${state}") ${query} }`);
  console.log('hm', data);
  return [data?.location, error];
}

export function useScenarioQuery(query) {
  const {scenario} = useModelData();
  const [data, error] = useLocationQuery(
    `{ scenario(id: "${scenario}") ${query} }`
  );
  return [data?.scenario, error];
}

export function useDistributionQuery(distribution, query) {
  const [data, error] = useScenarioQuery(`{ ${distribution} ${query} }`);
  return [(data && data[distribution]) || null, error];
}
