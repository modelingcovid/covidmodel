export function computeDerivedTimeSeriesData(data) {
  let prevD = {};
  data.forEach((d) => {
    for (let [key, value] of Object.entries(d)) {
      if (!value || typeof value !== 'object') {
        continue;
      }
      value.delta = {};
      for (let [key2, value2] of Object.entries(value)) {
        if (typeof value2 === 'number' && !Number.isNaN(value2)) {
          value.delta[key2] = value2 - ((prevD[key] && prevD[key][key2]) || 0);
        }
      }
    }
    prevD = d;
  });
  return data;
}

// Computes derived data and modifies the model in-place.
export function computeDerivedData(model) {
  if (model.hasDerivedData) {
    return;
  }
  model.hasDerivedData = true;

  for (let scenarioData of Object.values(model.scenarios)) {
    computeDerivedTimeSeriesData(scenarioData.timeSeriesData);
  }
  return model;
}
