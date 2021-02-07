export function getCache<A extends object, B, C>(
  map: WeakMap<A, Map<B, C>>,
  key: A
) {
  const cache = map.get(key);
  if (cache) return cache;
  const newMap = new Map<B, C>();
  map.set(key, newMap);
  return newMap;
}

export function genericMemo<D extends object, A extends unknown[], B, C>(
  fn: (base: D, ...args: A) => B,
  getKey: (...args: A) => C
) {
  const cache = new WeakMap<D, Map<C, B>>();
  return (base: D, ...args: A) => {
    const map = getCache(cache, base);

    const key = getKey(...args);
    const existingValue = map.get(key);
    if (existingValue === undefined) {
      const value = fn(base, ...args);
      map.set(key, value);
      return value;
    } else {
      return existingValue;
    }
  };
}
export function memo<D extends object, A extends [number | string], B>(
  fn: (base: D, ...args: A) => B
) {
  return genericMemo<D, A, B, A[0]>(fn, (a) => a);
}
