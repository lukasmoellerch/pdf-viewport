interface GenericMap<K, V> {
  get(k: K): V | undefined;
  set(k: K, v: V): void;
}

export function getOrDefault<K, V>(
  map: GenericMap<K, V>,
  key: K,
  defaultValue: V
) {
  const existing = map.get(key);
  if (existing !== undefined) return existing;
  map.set(key, defaultValue);
  return defaultValue;
}
