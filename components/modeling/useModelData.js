import * as React from 'react';
import {stateLabels} from '../../lib/controls';
import {flattenData} from '../../lib/transform';

const {createContext, useContext, useMemo} = React;

const ModelDataContext = createContext(null);

export const ModelDataProvider = ({
  children,
  model,
  scenario,
  state,
  states,
  x,
}) => {
  const context = useMemo(() => {
    const scenarioData = model.scenarios[scenario];
    const {summary} = scenarioData;

    const allTimeSeriesData = flattenData(
      Object.values(model.scenarios),
      (s) => s.timeSeriesData
    );

    return {
      model,
      scenario,
      state,
      states,
      x,
      // Derived properties:
      scenarioData,
      summary: scenarioData.summary,
      timeSeriesData: scenarioData.timeSeriesData,
      // Computed properties:
      stateName: stateLabels[state],
      allTimeSeriesData,
    };
  }, [model, scenario, state, states, x]);

  return (
    <ModelDataContext.Provider value={context}>
      {children}
    </ModelDataContext.Provider>
  );
};

export const useModelData = () => {
  const context = useContext(ModelDataContext);
  if (!context) {
    throw new Error('useModelData requires a ModelDataContext to be set');
  }
  return context;
};

export const WithModelData = ({children}) => children(useModelData());
