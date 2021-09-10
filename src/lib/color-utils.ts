export interface RGBColor {
  /**
   * Red
   * h ∈ [0, 255]
   */
  r: number;
  /**
   * Green
   * h ∈ [0, 255]
   */
  g: number;
  /**
   * Blue
   * h ∈ [0, 255]
   */
  b: number;
}

export interface HSLColor {
  /**
   * The hue of the color
   * h ∈ [0, 1]
   */
  h: number;
  /**
   * The saturation of the color
   * s ∈ [0, 1]
   */
  s: number;
  /**
   * The lightness of the color
   * l ∈ [0, 1]
   */
  l: number;
}

export const rgbToHsl = ({ r, g, b }: RGBColor): HSLColor => {
  const ur = r / 255;
  const ug = g / 255;
  const ub = b / 255;
  const xMax = Math.max(ur, ug, ub);
  const xMin = Math.min(ur, ug, ub);
  const c = xMax - xMin;
  const l = (xMax + xMin) / 2;
  const h =
    c === 0
      ? 0
      : xMax === ur
      ? (1 / 6) * (0 + (ug - ub) / c)
      : xMax === ug
      ? (1 / 6) * (2 + (ub - ur) / c)
      : xMax === ub
      ? (1 / 6) * (4 + (ur - ug) / c)
      : 0;
  const s = l === 0 || l === 1 ? 0 : (xMax - l) / Math.min(l, 1 - l);
  return { h: (h + 1) % 1, s, l };
};
