import {useRouter} from 'next/router';

import {Layout} from '../../components';
import COUNTRIES from '../../lib/countries';

export default () => {
  const {push} = useRouter();
  const handleCountrySelect = (e) => {
    push(`/country/${e.target.value}`);
  };

  return (
    <Layout noPad>
      <div className="flex flex-col justify-start">
        <div className="sticky border-t-2 border-b-2 border-gray-600 top-0 flex flex-col md:flex-row mb-4 bg-white px-6 py-4">
          <div className="mr-10">
            <div className="text-gray-700">Country: </div>
            <div className="inline-block relative w-64">
              <select
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                onChange={handleCountrySelect}
                value="-"
              >
                {Object.keys(COUNTRIES).map((s) => (
                  <option>{s}</option>
                ))}
                <option>-</option>
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
        </div>
      </div>
    </Layout>
  );
};
