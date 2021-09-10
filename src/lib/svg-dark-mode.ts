import { darkModeTransform } from "./dark-mode";
import { SvgMiddleware } from "./utils";

const applyColorTransform = (
  rootElement: SVGElement,
  fn: (color: string) => string
) => {
  rootElement.style.fill = fn("#000000");
  rootElement.style.backgroundColor = fn("#ffffff");

  const attributes = ["fill", "stroke"] as const;
  for (const attribute of attributes) {
    rootElement.querySelectorAll(`[${attribute}]`).forEach(element => {
      const attributeValue = element.getAttribute(attribute);
      if (attributeValue === "none") return;
      if (attributeValue === undefined || attributeValue === null) return;
      element.setAttribute(attribute, fn(attributeValue));
    });
  }
};

/**
 * `darkModeSvgMiddleware` is a simple `SvgMiddleware` which inverts the stroke color and the
 * fill color of paths and text. It can be used in places where a `middleware` can be provided.
 *
 * @param element The element which should be transformed into its dark-mode variant
 */
export const darkModeSvgMiddleware: SvgMiddleware = element => {
  applyColorTransform(element, darkModeTransform);
};
