import useSWR from 'swr';

const fetcher = (query) =>
  fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({query}),
  })
    .then((res) => res.json())
    .then((json) => json.data);

export function Test() {
  const {data, error} = useSWR('{ locations { name } }');

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const {locations} = data;

  return (
    <div>
      {locations.map((location, i) => (
        <div key={i}>{location.name}</div>
      ))}
    </div>
  );
}
