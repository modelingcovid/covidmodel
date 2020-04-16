export function maybe(fn, ...args) {
  return fn && typeof fn === 'function' ? fn(...args) : fn;
}
