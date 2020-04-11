import * as React from 'react';
import useSWR from 'swr';
import {createLocationQuery, createScenarioQuery, useLocations} from './query';
import {stateLabels} from '../../lib/controls';
import {addDays, today} from '../../lib/date';
import {flattenData} from '../../lib/transform';
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
  return [data?.location?.scenarios?.day?.data || [], error];
};

export const ModelStateProvider = ({
  children,
  scenarioId,
  locationId,
  setScenario,
}) => {
  const [locations] = useLocations();
  const [scenarios] = useScenarios();
  const [days] = useDays();

  const id = useComponentId('model');
  const context = useMemo(() => {
    const location = locations.find(({id}) => id === locationId) || {
      id: locationId,
    };
    const scenario = scenarios.find(({id}) => id === scenarioId) || {
      id: scenarioId,
    };

    return {
      days,
      id,
      location,
      locations,
      scenario,
      setScenario,
    };
  }, [days, id, locationId, locations, scenarioId, scenarios, setScenario]);

  return (
    <ModelStateContext.Provider value={context}>
      {children}
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
