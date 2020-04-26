import * as React from 'react';
import {stateLabels} from '../../lib/controls';
import {dayToDate, initialTargetDate} from '../../lib/date';
import {memo} from '../../lib/fn';
import {NearestDataProvider} from '../graph';
import {useComponentId} from '../util';
import {fetchLocationData} from '../query';
import {StatefulContainmentStrategy} from './useContainmentStrategy';

const {createContext, useContext, useMemo} = React;

const ModelStateContext = createContext(null);

const isServer = typeof window === 'undefined';

export const useCreateModelState = ({scenarioId, locationId, setScenario}) => {
  const {locations, scenarios, days} = fetchLocationData(
    locationId,
    scenarioId
  );

  const id = useComponentId('model');
  return useMemo(() => {
    const location = {
      id: locationId,
      // NOTE: This should be better... but c'est la vie
      name: stateLabels[locationId],
    };

    const scenario = {
      id: scenarioId,
      name: '',
    };

    return {
      get days() {
        return isServer ? [] : days();
      },
      get locations() {
        return isServer ? [defaultLocation] : locations();
      },
      get scenarios() {
        return isServer ? [defaultScenario] : scenarios();
      },
      id,
      indices: memo(
        function indices() {
          return isServer ? [] : Object.keys(days());
        },
        {max: 1}
      ),
      location,
      scenario,
      scenarioData() {
        if (isServer) {
          return scenario;
        }
        return scenarios().find(({id}) => id === scenarioId);
      },
      setScenario,
      x(i) {
        return dayToDate(days()[i]);
      },
    };
  }, [days, id, locationId, locations, scenarioId, scenarios, setScenario]);
};

export const ModelStateProvider = ({children, value}) => {
  return (
    <ModelStateContext.Provider value={value}>
      <StatefulContainmentStrategy>
        <NearestDataProvider
          x={value.x}
          data={value.indices}
          initial={initialTargetDate}
        >
          {children}
        </NearestDataProvider>
      </StatefulContainmentStrategy>
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
