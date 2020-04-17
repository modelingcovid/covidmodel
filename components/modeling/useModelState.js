import * as React from 'react';
import {stateLabels} from '../../lib/controls';
import {addDays, dayToDate, initialTargetDate, today} from '../../lib/date';
import {memo} from '../../lib/fn';
import {flattenData} from '../../lib/transform';
import {NearestDataProvider} from '../graph';
import {useComponentId} from '../util';
import {fetchLocationData} from '../query';

const {createContext, useContext, useMemo} = React;

const ModelStateContext = createContext(null);

const isServer = typeof window === 'undefined';

export const ModelStateProvider = ({
  children,
  scenarioId,
  locationId,
  setScenario,
}) => {
  const {locations, scenarios, days} = fetchLocationData(
    locationId,
    scenarioId
  );

  const id = useComponentId('model');
  const context = useMemo(() => {
    const location = {
      id: locationId,
      // NOTE: This should be better... but c'est la vie
      name: stateLabels[locationId],
    };

    const scenario = {
      id: scenarioId,
      name: '',
    };

    // const distancingEnds = addDays(today, scenario.distancingDays);
    // const distancingIndices = indices.filter((d) => x(d) <= distancingEnds);

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
