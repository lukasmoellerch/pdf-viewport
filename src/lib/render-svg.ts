import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { getGfx, getOperatorList, getPage } from "./promise-memo";
import { getOrDefault, SvgMiddleware } from "./utils";

const svgMap = new WeakMap<
  PDFDocumentProxy,
  Map<number, Promise<SVGElement>>
>();

const idSvgMiddleware: SvgMiddleware = _x => {};

/**
 * Renders the page `pageNumber` to an SVGElement. The returned instance will
 * be unique and the caller is free to mount it anywhere in the tree.
 * @param pdf
 * @param pageNumber
 */
export const renderSVG = async (
  pdf: PDFDocumentProxy,
  pageNumber: number,
  middleware: SvgMiddleware = idSvgMiddleware
) => {
  const cache = getOrDefault(
    svgMap,
    pdf,
    new Map<number, Promise<SVGElement>>()
  );

  const cachedSvg = cache.get(pageNumber);
  if (cachedSvg !== undefined) {
    const element = (await cachedSvg).cloneNode(true) as SVGElement;
    element.style.fill = "#000000";
    element.style.backgroundColor = "#ffffff";
    if (middleware !== idSvgMiddleware) {
      middleware(element);
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
    el.style.fill = "#000000";
    el.style.backgroundColor = "#ffffff";
    if (middleware !== idSvgMiddleware) {
      const retEl = el.cloneNode(true) as SVGElement;
      middleware(retEl);
      return retEl;
    } else {
      return el;
    }
  });
};
