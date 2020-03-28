import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

import {Layout} from '../../components';
import COUNTRIES from '../../lib/countries';

export default () => {
  const {
    query: {state},
    push,
  } = useRouter();
  const [scenario, setScenario] = React.useState('scenario1');

  const handleCountrySelect = (e) => {
    push(`/country/${e.target.value}`);
  };

  return (
    <Layout noPad>
      <div className="flex flex-col justify-center">
        <div className="sticky border-t-2 border-b-2 border-gray-600 top-0 flex flex-col md:flex-row mb-4 bg-white px-6 py-4">
          <div className="sm:mb-10 md:mb-0 md:mr-10">
            <div className="text-gray-700">State: </div>
            <div className="inline-block relative w-64">
              <select
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                onChange={handleCountrySelect}
                value={state}
              >
                {Object.keys(COUNTRIES).map((s) => (
                  <option value={s}>{COUNTRIES[s]}</option>
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
                      checked={scenario === 'scenario4'}
                      onClick={() => setScenario('scenario4')}
                    />
                    <span class="ml-2">Return to normal (no distancing)</span>
                  </label>
                </div>
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
                      Continue current distancing level for 3 months
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
        <div className="flex flex-col px-6">
          <div className="mb-4 bg-white rounded overflow-hidden shadow-lg px-6 py-4">
            Work in progres: To show aggregated state-data, and a map.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps = ({params: {country}}) => {
  //   const rawdata = fs.readFileSync(
  //     path.join(process.cwd(), 'public/json/country/demographics.json')
  //   );
  //   const rawsummarydata = fs.readFileSync(
  //     path.join(process.cwd(), `public/json/state/${state}/summary.json`)
  //   );
  //   const demographics = JSON.parse(rawdata);
  //   const summary = JSON.parse(rawsummarydata);

  return {
    props: {
      //   demographics: demographics[state],
      //   summary,
    },
  };
};

export const getStaticPaths = (_ctx) => {
  return {
    paths: Object.keys(COUNTRIES).map((ct) => ({
      params: {
        country: ct,
      },
    })),
    fallback: false,
  };
};
