import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { darkModeTransform } from "./dark-mode";
import { getGfx, getOperatorList, getPage } from "./promise-memo";
import { getOrDefault } from "./utils";

const svgMap = new WeakMap<
  PDFDocumentProxy,
  Map<number, Promise<SVGElement>>
>();

const id = <T>(x: T) => x;

const applyColorTransform = (
  rootElement: SVGElement,
  fn: (color: string) => string = id
) => {
  rootElement.style.fill = fn("#000000");
  rootElement.style.backgroundColor = fn("#ffffff");
  if (fn === id) return;

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
 * Renders the page `pageNumber` to an SVGElement. The returned instance will
 * be unique and the caller is free to mount it anywhere in the tree.
 * @param pdf
 * @param pageNumber
 */
export const renderSVG = async (
  pdf: PDFDocumentProxy,
  pageNumber: number,
  darkMode: boolean = false
) => {
  const cache = getOrDefault(
    svgMap,
    pdf,
    new Map<number, Promise<SVGElement>>()
  );

  const cachedSvg = cache.get(pageNumber);
  if (cachedSvg !== undefined) {
    const element = (await cachedSvg).cloneNode(true) as SVGElement;
    if (darkMode) {
      applyColorTransform(element, darkModeTransform);
    } else {
      applyColorTransform(element);
    }
    return element;
  }

  const promise = (async () => {
    const page = await getPage(pdf, pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const operatorList = await getOperatorList(pdf, pageNumber);
    const gfx = await getGfx(pdf, pageNumber);
    return gfx.getSVG(operatorList, viewport) as Promise<SVGElement>;
  })();

  cache.set(pageNumber, promise);

  return promise.then(el => {
    if (darkMode) {
      const retEl = el.cloneNode(true) as SVGElement;
      applyColorTransform(retEl, darkModeTransform);
      return retEl;
    } else {
      applyColorTransform(el);
      return el;
    }
  });
};
