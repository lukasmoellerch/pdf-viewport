import { rgbToHsl } from "./color-utils";

/**
 * Map maps `x` from the range `[inMin, inMax]` to the range `[outMin, outMax]`.
 * @param x The value to map.
 * @param inMin The minimum value of the input range.
 * @param inMax The maximum value of the input range.
 * @param outMin The minimum value of the output range.
 * @param outMax The maximum value of the output range.
 */
const map = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

/**
 * Converts `color` to its dark-mode variant.
 * @param color Color to convert to dark mode
 */
export const darkModeTransform = (color: string) => {
  // parse the color, which is either given in hex notation #ffeeff or in rgb notation rgb(255, 255, 255)
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(color);
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/.exec(color);
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;
  if (hex) {
    r = parseInt(hex[1], 16);
    g = parseInt(hex[2], 16);
    b = parseInt(hex[3], 16);
  } else if (rgb) {
    r = parseInt(rgb[1], 10);
    g = parseInt(rgb[2], 10);
    b = parseInt(rgb[3], 10);
  } else if (rgba) {
    r = parseInt(rgba[1], 10);
    g = parseInt(rgba[2], 10);
    b = parseInt(rgba[3], 10);
    a = parseInt(rgba[4], 10);
  } else {
    console.error(color);
  }
  const { h, s, l } = rgbToHsl({ r, g, b });
  const result = `hsla(${(h * 360).toFixed(2)}, ${(s * 100).toFixed(2)}%, ${map(
    l,
    0,
    1,
    100,
    12
  ).toFixed(2)}%, ${a.toFixed(2)})`;
  return result;
};
