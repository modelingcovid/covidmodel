export const stackAccessors = (accessors, zero = 0) => {
  let prev = () => zero;
  const result = [];
  const reversed = accessors.slice(0).reverse();
  for (let accessor of reversed) {
    const bound = prev;
    const stacked = (...d) => bound(...d) + accessor(...d);
    result.push([prev, stacked]);
    prev = stacked;
  }
  return result.reverse();
};
