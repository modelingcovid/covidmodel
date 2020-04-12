import * as React from 'react';
import useSWR from 'swr';
import {createLocationQuery, createScenarioQuery, useLocations} from './query';
import {stateLabels} from '../../lib/controls';
import {addDays, dayToDate, initialTargetDate, today} from '../../lib/date';
import {flattenData} from '../../lib/transform';
import {NearestDataProvider} from '../graph';
import {useComponentId} from '../util';

const {createContext, useContext, useMemo} = React;

const ModelStateContext = createContext(null);

const useScenarios = (locationId) => {
  const {data, error} = useSWR(
    createLocationQuery(
      locationId,
      `{
        scenarios {
          id
          name
          distancingLevel
          distancingDays
        }
      }`
    )
  );
  return [data?.location?.scenarios || [], error];
};

const useDays = (locationId, scenarioId) => {
  const {data, error} = useSWR(
    createLocationQuery(
      locationId,
      createScenarioQuery(
        scenarioId,
        `{
          day {
            data
          }
        }`
      )
    )
  );
  return [data?.location?.scenario?.day?.data || [], error];
};

export const ModelStateProvider = ({
  children,
  scenarioId,
  locationId,
  setScenario,
}) => {
  const [locations] = useLocations();
  const [scenarios] = useScenarios(locationId);
  const [days] = useDays(locationId, scenarioId);

  const id = useComponentId('model');
  const context = useMemo(() => {
    const location = locations.find(({id}) => id === locationId) || {
      id: locationId,
      name: '',
    };
    const scenario = scenarios.find(({id}) => id === scenarioId) || {
      id: scenarioId,
      name: '',
    };
    const x = (i) => dayToDate(days[i]);
    return {
      days,
      id,
      indices: Object.keys(days),
      location,
      locations,
      scenario,
      scenarios,
      setScenario,
      x,
    };
  }, [days, id, locationId, locations, scenarioId, scenarios, setScenario]);

  return (
    <ModelStateContext.Provider value={context}>
      <NearestDataProvider
        x={context.x}
        data={context.indices}
        initial={initialTargetDate}
      >
        {children}
      </NearestDataProvider>
    </ModelStateContext.Provider>
  );
};

export const useModelState = () => {
  const context = useContext(ModelStateContext);
  if (!context) {
    throw new Error('useModelState requires a ModelStateContext to be set');
  }
  return context;
};

export const WithModelState = ({children}) => children(useModelState());
