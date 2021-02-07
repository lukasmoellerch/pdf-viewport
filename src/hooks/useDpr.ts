import { useEffect, useState } from "react";

/**
 * Returns the windows dpr and updates it when it changes.
 * It should only be used on client-side components as it uses `devicePixelRatio`.
 * @returns the current value of `window.devicePixelRatio`
 */
export default function useDpr() {
  const [dpr, setDpr] = useState(devicePixelRatio);
  useEffect(() => {
    const listener = () => {
      setDpr(devicePixelRatio);
    };
    const dpr = devicePixelRatio;
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
