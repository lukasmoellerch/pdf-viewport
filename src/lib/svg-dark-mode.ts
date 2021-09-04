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

export const darkModeSvgMiddleware: SvgMiddleware = element => {
  applyColorTransform(element, darkModeTransform);
};
