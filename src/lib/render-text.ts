import { renderTextLayer } from "pdfjs-dist/es5/build/pdf";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { ensureStylesheetRule } from "./cssom";
import { getCache } from "./memo";
import { getPage } from "./promise-memo";

/*
 await (async () => {
        const reader = textContentStreamCopy.getReader();
        while (true) {
          const a = await reader.read();
          if (a.done) break;
          const { items } = a.value as {
            items: {
              dir: "ltr";
              height: number;
              width: number;
              transform: [number, number, number, number, number, number];
            }[];
          };
          for (let item of items) {
            const [_x, y] = [item.transform[4], item.transform[5]];

            const yStart =
              viewport.height / scale - (y + item.height) - 20 / scale;
            const height = item.height + 40 / scale;

            intervals.push([yStart, yStart + height]);
          }
        }
      })();
*/

const textMap = new WeakMap<
  PDFDocumentProxy,
  Map<number, Promise<HTMLDivElement>>
>();

const streamMap = new WeakMap<
  PDFDocumentProxy,
  Map<number, Promise<ReadableStream<any>>>
>();

const VIEWPORT_SCALE = 8;

export const getStream = (pdf: PDFDocumentProxy, pageNumber: number) => {
  const cache = getCache(streamMap, pdf);
  const cached = cache.get(pageNumber);
  if (cached !== undefined) {
    const promise = cached.then(stream => stream.tee());

    const a = promise.then(r => r[0]);
    const b = promise.then(r => r[1]);

    cache.set(pageNumber, b);

    return a;
  } else {
    const promise = (async () => {
      const page = await getPage(pdf, pageNumber);
      return page.streamTextContent().tee();
    })();

    const a = promise.then(r => r[0]);
    const b = promise.then(r => r[1]);

    cache.set(pageNumber, b);

    return a;
  }
};

/**
 * Renders the text layer of the specified `pageNumber`
 * @param pageNumber
 */
export const renderText = async (pdf: PDFDocumentProxy, pageNumber: number) => {
  const cache = getCache(textMap, pdf);
  const cached = cache.get(pageNumber);

  if (cached !== undefined) {
    return cached.then(e => e.cloneNode(true) as HTMLDivElement);
  }

  ensureStylesheetRule("renderText", ".text-container > span", [
    ["position", "absolute"],
    ["color", "transparent"],
    ["display", "inline"],
    ["white-space", "pre"],
    ["cursor", "text"],
    ["transform-origin", "0% 0%"],
    ["line-height", "1"],
  ]);

  const container = document.createElement("div");

  const contentPromise = (async () => {
    const page = await getPage(pdf, pageNumber);
    const textContentStream = await getStream(pdf, pageNumber);
    const viewport = await page.getViewport({ scale: VIEWPORT_SCALE });

    container.style.position = "relative";
    container.style.transform = `scale(${1 / VIEWPORT_SCALE})`;
    container.style.transformOrigin = "0% 0%";
    container.classList.add("text-container");

    const textDivs: HTMLElement[] = [];
    const textContentItemsStr: string[] = [];
    const tl = renderTextLayer({
      textContentStream,
      container,
      viewport,
      textDivs,
      enhanceTextSelection: true,
      textContentItemsStr,
    });
    await tl.promise;
    return container;
  })();

  cache.set(pageNumber, contentPromise);
  return container;
};
