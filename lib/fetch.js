import unfetch from 'isomorphic-unfetch';

export function fetch(query) {
  return unfetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({query}),
  })
    .then((res) => res.json())
    .then((json) => json.data);
}
