import unfetch from 'isomorphic-unfetch';

export function fetchPromise(query) {
  return unfetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({query}),
  })
    .then((res) => res.json())
    .then((json) => json.data);
  // .then((result) => new Promise((r) => setTimeout(r, 5000, result)));
}

export function createSuspendable(promise) {
  let status = 'pending';
  let result;
  const suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      result = e;
    }
  );
  return function suspendable() {
    if (status === 'pending') {
      if (typeof window === 'undefined') {
        throw new Error(
          'React doesn’t support Suspense on the server yet. Ensure this is within a Suspense boundary that always renders a server-side fallback.'
        );
      }
      throw suspender;
    } else if (status === 'error') {
      throw result;
    } else if (status === 'success') {
      return result;
    }
  };
}

const cache = {};

export function fetchSuspendable(query, clear = false) {
  if (clear) {
    delete cache[query];
  }
  if (!cache[query]) {
    cache[query] = createSuspendable(fetchPromise(query));
    cache[query].query = query;
  }
  return cache[query];
}

export function fetchMap(queryMap) {
  const properties = {};
  Object.entries(queryMap).forEach(([key, query]) => {
    properties[key] = {
      get: fetch(query),
    };
  });
  return Object.defineProperties({}, properties);
}
