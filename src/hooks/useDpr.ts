import { useEffect, useState } from "react";

type DprType<C extends boolean> = number | (C extends true ? undefined : never);
/**
 * Returns the windows dpr and updates it when it changes.
 * If `ssr` is false it should only be used on client-side components
 * as it uses `devicePixelRatio`.
 * @returns the current value of `window.devicePixelRatio`
 */
export default function useDpr<T extends boolean>(ssr: T): DprType<T> {
  // In ssr mode we have to ensure that no window property is accessed and that the returned value of the first render
  // match up. We just default to a dpr of 1 here.
  const [dpr, setDpr] = useState<DprType<T>>(
    ssr ? (undefined as DprType<T>) : devicePixelRatio
  );
  useEffect(() => {
    // In ssr mode we set dpr to 1.0 initially so we have to ensure that it has
    // a correct initial value that the other effect can work with.
    if (ssr) setDpr(devicePixelRatio);
  }, [ssr]);
  useEffect(() => {
    const listener = () => {
      setDpr(devicePixelRatio);
    };
    const dpr = devicePixelRatio;
    // this media query only matches as long as the dpr stays the same - if it changes we set the dpr
    // state variable and afterwards create a new media query and listen to it.
    const mediaQueryList = matchMedia(
      [
        `(-webkit-min-device-pixel-ratio: ${dpr}) and (-webkit-max-device-pixel-ratio: ${dpr})`,
        `(min--moz-device-pixel-ratio: ${dpr}) and (max--moz-device-pixel-ratio: ${dpr})`,
        `(-o-min-device-pixel-ratio: ${dpr}) and (-o-max-device-pixel-ratio: ${dpr})`,
        `(min-device-pixel-ratio: ${dpr}) and (max-device-pixel-ratio: ${dpr})`,
        `(min-resolution: ${dpr}dppx) and (max-resolution: ${dpr}dppx)`,
      ].join(", ")
    );
    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [dpr]);
  return dpr;
}
