import React from 'react';
import {useRouter} from 'next/router';
import Layout from '../../components/Layout';
import STATES from '../../lib/states';

export default () => {
  const {
    query: {state},
    push,
  } = useRouter();
  const [scenario, setScenario] = React.useState('scenario1');

  const handleStateSelect = (e) => {
    push(`/state/${e.target.value}`);
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center">
        <div className="flex sm:flex-col md:flex-row mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
          <div className="mr-10">
            <div className="text-gray-700">State: </div>
            <div className="inline-block relative w-64">
              <select
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                onChange={handleStateSelect}
                value={state}
              >
                {STATES.map((s) => (
                  <option>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div class="block">
              <span class="text-gray-700">Scenario: </span>
              <div class="mt-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio"
                      name="radio"
                      checked={scenario === 'scenario1'}
                      onClick={() => setScenario('scenario1')}
                    />
                    <span class="ml-2">
                      Continue Current Distancing Level for 3 months
                    </span>
                  </label>
                </div>
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio"
                      name="radio"
                      checked={scenario === 'scenario2'}
                      onClick={() => setScenario('scenario2')}
                    />
                    <span class="ml-2">
                      Increase distancing to Italy levels for 3 months
                    </span>
                  </label>
                </div>
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      class="form-radio"
                      name="radio"
                      checked={scenario === 'scenario3'}
                      onClick={() => setScenario('scenario3')}
                    />
                    <span class="ml-2">
                      Increase distancing to Wuhan levels for 2 months
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
            <div className="font-bold text-xl mb-2">Model Inputs</div>
            <div className="flex flex-around sm:flex-col md:flex-row">
              <div className="w-1/2 sm:mr-0 md:mr-10">
                <div>
                  <div className="text-gray-600 mb-2">Social Distancing</div>
                  <div className="text-gray-800 text-sm mb-4">
                    On the left axis social distance of 100% means no contact
                    with others, which yields an R0 (basic reproduction number)
                    for the virus of zero, since it cannot find new hosts. The
                    zero-percent distance is the un-inhibited reproduction
                    number which is thought to be around 3.1.
                  </div>
                  <img src={`/svg/state/${state}/${scenario}/Distancing.svg`} />
                </div>
              </div>
              <div className="w-1/2">
                <div className="text-gray-600 mb-2">Demographic Parameters</div>
                {/* <table class="table-fixed">
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2">Population</td>
                      <td class="border px-4 py-2">
                        {stateDemographics.Population}
                      </td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">Virus Import Date</td>
                      <td class="border px-4 py-2">
                        {stateDemographics.importtime}
                      </td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">Total Ventalators</td>
                      <td class="border px-4 py-2">
                        {stateDemographics.ventalators}
                      </td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">
                        Probability of Not needing hospitalization
                      </td>
                      <td class="border px-4 py-2">{stateDemographics.pS}</td>
                    </tr>

                    <tr>
                      <td class="border px-4 py-2">
                        Probability of needing hospitalization wihtout ICU
                      </td>
                      <td class="border px-4 py-2">{stateDemographics.pH}</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">
                        Probability of needing ICU care
                      </td>
                      <td class="border px-4 py-2">{stateDemographics.pC}</td>
                    </tr>
                  </tbody>
                </table> */}
              </div>
            </div>
          </div>
          <div className="bg-white rounded overflow-hidden shadow-lg px-6 py-4">
            <div className="font-bold text-xl mb-2">Model Predictions</div>
            <img src={`/svg/state/${state}/${scenario}/ICU.svg`} />
            <img src={`/svg/state/${state}/${scenario}/Deaths.svg`} />
            <img src={`/svg/state/${state}/${scenario}/Progression.svg`} />
          </div>
        </div>
      </div>
    </Layout>
  );
};
