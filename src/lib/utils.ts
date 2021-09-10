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

/**
 * A `CanvasMiddleware` can make changes to a CanvasRenderingContext2D instance provided by
 * pdf-viewport. The return value is used as the render target internally. Modifications can
 * either be made directly on @param ctx or a new CanvasRenderingContext2d can be returned if it is
 * necessary to change the prototype. @see ProxyContext.
 *
 * `CanvasMiddleware` is designed to be chainable.
 */
export type CanvasMiddleware = (
  ctx: CanvasRenderingContext2D
) => CanvasRenderingContext2D;

/**
 * `SvgMiddleware` can be used to make modifications to the SVG element before it is being displayed.
 *
 * `SvgMiddleware` is designed to be chainable.
 */
export type SvgMiddleware = (element: SVGElement) => void;
